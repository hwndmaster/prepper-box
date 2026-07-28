using System.Net;
using System.Text;

namespace Genius.PrepperBox.WebApi.IntegrationTests.Infrastructure;

/// <summary>
/// Stubs the external OpenFoodFacts service so integration tests stay hermetic. Any path that was not
/// explicitly configured answers with the given fallback status code (404 by default).
/// </summary>
internal sealed class FakeOpenFoodFactsHttpMessageHandler : HttpMessageHandler
{
    private readonly object _syncRoot = new();
    private readonly Dictionary<string, string> _jsonResponsesByPath = new(StringComparer.OrdinalIgnoreCase);
    private readonly List<Uri> _requests = [];

    private HttpStatusCode _fallbackStatusCode = HttpStatusCode.NotFound;

    public IReadOnlyList<Uri> Requests
    {
        get
        {
            lock (_syncRoot)
            {
                return _requests.ToArray();
            }
        }
    }

    public void SetJsonResponse(string absolutePath, string json)
    {
        lock (_syncRoot)
        {
            _jsonResponsesByPath[absolutePath] = json;
        }
    }

    public void SetFallbackStatusCode(HttpStatusCode statusCode)
    {
        lock (_syncRoot)
        {
            _fallbackStatusCode = statusCode;
        }
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var requestUri = request.RequestUri ?? throw new InvalidOperationException("OpenFoodFacts request URI was not set.");
        string? json;
        HttpStatusCode fallbackStatusCode;

        lock (_syncRoot)
        {
            _requests.Add(requestUri);
            _jsonResponsesByPath.TryGetValue(requestUri.AbsolutePath, out json);
            fallbackStatusCode = _fallbackStatusCode;
        }

        if (json is null)
        {
            return Task.FromResult(new HttpResponseMessage(fallbackStatusCode)
            {
                RequestMessage = request
            });
        }

        return Task.FromResult(new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json"),
            RequestMessage = request
        });
    }
}
