using System.Net;
using System.Text;

namespace Genius.PrepperBox.WebApi.IntegrationTests.Infrastructure;

/// <summary>
/// Stubs the external SerpApi service behind the image search so integration tests stay hermetic and
/// never spend real searches. Every request gets the one configured response, which by default is a
/// successful search without any images.
/// </summary>
internal sealed class FakeSerpApiHttpMessageHandler : HttpMessageHandler
{
    private readonly object _syncRoot = new();
    private readonly List<Uri> _requests = [];

    private HttpStatusCode _statusCode = HttpStatusCode.OK;
    private string _json = """{ "images_results": [] }""";

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

    /// <summary>
    /// Sets the response to answer with. SerpApi reports failures as JSON too, e.g. <c>{"error": "..."}</c>.
    /// </summary>
    public void SetResponse(HttpStatusCode statusCode, string json)
    {
        lock (_syncRoot)
        {
            _statusCode = statusCode;
            _json = json;
        }
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var requestUri = request.RequestUri ?? throw new InvalidOperationException("SerpApi request URI was not set.");
        HttpStatusCode statusCode;
        string json;

        lock (_syncRoot)
        {
            _requests.Add(requestUri);
            statusCode = _statusCode;
            json = _json;
        }

        return Task.FromResult(new HttpResponseMessage(statusCode)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json"),
            RequestMessage = request
        });
    }
}
