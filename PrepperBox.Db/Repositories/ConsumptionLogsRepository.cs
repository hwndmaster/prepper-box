using System.Linq.Expressions;
using Genius.PrepperBox.Db.Models;
using Genius.PrepperBox.Dto;
using Genius.PrepperBox.Dto.References;
using Genius.PrepperBox.Dto.RequestMessages;
using Microsoft.EntityFrameworkCore;

namespace Genius.PrepperBox.Db.Repositories;

public interface IConsumptionLogsRepository : IRepository<int, ConsumptionLogRef, ConsumptionLogDto, CreateConsumptionLogRequest, UpdateConsumptionLogRequest>
{
}

internal sealed class ConsumptionLogsRepository : BaseRepository<ConsumptionLog, int, ConsumptionLogRef, ConsumptionLogDto, CreateConsumptionLogRequest, UpdateConsumptionLogRequest>, IConsumptionLogsRepository
{
    public ConsumptionLogsRepository(IDateTime dateTime, IDatabaseContext databaseContext)
        : base(dateTime, databaseContext)
    {
    }

    protected override Expression<Func<ConsumptionLog, ConsumptionLogDto>> ProjectToGetDto()
        => b => new ConsumptionLogDto(b.Id, b.ProductId, b.Quantity, b.Reason, b.DateCreated, b.LastModified);

    protected override ConsumptionLog MapCreateDto(CreateConsumptionLogRequest dto)
        => new(dto.ProductId, dto.Quantity, dto.Reason);

    protected override ConsumptionLog MapUpdateDto(UpdateConsumptionLogRequest dto, ConsumptionLog existingEntity) =>
        existingEntity with
        {
            ProductId = dto.ProductId,
            Quantity = dto.Quantity,
            Reason = dto.Reason
        };
}
