using Genius.PrepperBox.Dto.References;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi;

namespace Genius.PrepperBox.WebApi.OpenApi;

/// <summary>
/// Transforms OpenAPI parameter schemas for Reference types (e.g. CategoryRef, ProductRef)
/// from <c>string</c> to <c>integer</c> so that NSwag generates the proper TypeScript
/// reference types instead of <c>string</c>.
/// </summary>
internal sealed class ReferenceParameterTransformer : IOpenApiOperationTransformer
{
    private static readonly HashSet<string> ReferenceTypeNames =
    [
        nameof(CategoryRef),
        nameof(ProductRef),
        nameof(StorageLocationRef),
        nameof(TrackedProductRef),
        nameof(ConsumptionLogRef),
    ];

    public Task TransformAsync(OpenApiOperation operation, OpenApiOperationTransformerContext context, CancellationToken cancellationToken)
    {
        var methodParams = context.Description.ActionDescriptor
            is Microsoft.AspNetCore.Mvc.Controllers.ControllerActionDescriptor cad
            ? cad.MethodInfo.GetParameters()
            : [];

        foreach (var paramInterface in operation.Parameters ?? [])
        {
            if (paramInterface is not OpenApiParameter param)
                continue;

            var methodParam = methodParams
                .FirstOrDefault(p => string.Equals(p.Name, param.Name, StringComparison.OrdinalIgnoreCase));
            if (methodParam == null)
                continue;

            var paramTypeName = methodParam.ParameterType.Name;
            if (ReferenceTypeNames.Contains(paramTypeName))
            {
                param.Schema = new OpenApiSchema
                {
                    Type = JsonSchemaType.Integer,
                    Format = "int32",
                    AdditionalProperties = new OpenApiSchema
                    {
                        Type = JsonSchemaType.String,
                        Format = paramTypeName,
                    }
                };
            }
        }

        return Task.CompletedTask;
    }
}
