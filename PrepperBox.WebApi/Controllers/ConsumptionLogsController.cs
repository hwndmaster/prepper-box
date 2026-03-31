using Genius.Atom.Data.Validation;
using Genius.Atom.Web.Controllers;
using Genius.PrepperBox.Db.Repositories;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;

namespace Genius.PrepperBox.WebApi.Controllers;

public sealed class ConsumptionLogsController : BaseCrudController<int, ConsumptionLogRef, ConsumptionLogDto, IConsumptionLogsRepository, CreateConsumptionLogRequest, UpdateConsumptionLogRequest>
{
    public ConsumptionLogsController(IConsumptionLogsRepository consumptionLogsRepository, IRequestValidators requestValidators)
        : base(consumptionLogsRepository, requestValidators)
    {
    }
}
