using System.Text.Json;

namespace Genius.PrepperBox.WebApi.IntegrationTests.Infrastructure;

internal static class HttpClientJsonExtensions
{
    public static async Task<JsonElement> GetJsonAsync(this HttpClient client, string requestUri)
    {
        var json = await client.GetStringAsync(requestUri, TestContext.Current.CancellationToken).ConfigureAwait(false);
        using var document = JsonDocument.Parse(json);
        return document.RootElement.Clone();
    }
}
