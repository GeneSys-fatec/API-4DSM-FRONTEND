import { describe, expect, it } from 'vitest';
import {
  parseBoundaryDate,
  parseRowDateTime,
  shouldIncludeRowByDate,
} from '../../src/components/weatherTableDateFilter';

describe('Weather Table Date Filter', () => {
  it('deve fazer parse de data no formato yyyy-mm-dd hh:mm', () => {
    const parsed = parseRowDateTime('2026-04-15 16:00');

    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(3);
    expect(parsed?.getDate()).toBe(15);
    expect(parsed?.getHours()).toBe(16);
    expect(parsed?.getMinutes()).toBe(0);
  });

  it('deve fazer parse de data no formato dd/mm/yyyy hh:mm', () => {
    const parsed = parseRowDateTime('15/04/2026 16:00');

    expect(parsed).not.toBeNull();
    expect(parsed?.getFullYear()).toBe(2026);
    expect(parsed?.getMonth()).toBe(3);
    expect(parsed?.getDate()).toBe(15);
    expect(parsed?.getHours()).toBe(16);
    expect(parsed?.getMinutes()).toBe(0);
  });

  it('deve remover html e espacos especiais antes de parsear', () => {
    const parsed = parseRowDateTime('<span>2026-04-15\u00A016:00</span>');

    expect(parsed).not.toBeNull();
    expect(parsed?.getDate()).toBe(15);
    expect(parsed?.getHours()).toBe(16);
  });

  it('deve fazer parse mesmo com entidade &nbsp no valor da célula', () => {
    const parsed = parseRowDateTime('2026-04-15&nbsp;16:00');

    expect(parsed).not.toBeNull();
    expect(parsed?.getDate()).toBe(15);
    expect(parsed?.getHours()).toBe(16);
  });

  it('deve retornar null para valor invalido', () => {
    const parsed = parseRowDateTime('sem-data-valida');

    expect(parsed).toBeNull();
  });

  it('deve criar limite inicial e final corretamente', () => {
    const from = parseBoundaryDate('2026-04-15', 'start');
    const to = parseBoundaryDate('2026-04-15', 'end');

    expect(from?.getHours()).toBe(0);
    expect(from?.getMinutes()).toBe(0);
    expect(from?.getSeconds()).toBe(0);

    expect(to?.getHours()).toBe(23);
    expect(to?.getMinutes()).toBe(59);
    expect(to?.getSeconds()).toBe(59);
  });

  it('deve incluir linha quando estiver dentro do intervalo', () => {
    const include = shouldIncludeRowByDate('2026-04-15 16:00', {
      from: '2026-04-10',
      to: '2026-04-20',
    });

    expect(include).toBe(true);
  });

  it('deve excluir linha quando estiver fora do intervalo', () => {
    const include = shouldIncludeRowByDate('2026-04-15 16:00', {
      from: '2026-04-16',
      to: '2026-04-20',
    });

    expect(include).toBe(false);
  });

  it('deve incluir linhas quando intervalo nao estiver definido', () => {
    const include = shouldIncludeRowByDate('2026-04-15 16:00', {});

    expect(include).toBe(true);
  });

  it('deve excluir linha quando data da linha for invalida e houver filtro', () => {
    const include = shouldIncludeRowByDate('data-invalida', {
      from: '2026-04-10',
      to: '2026-04-20',
    });

    expect(include).toBe(false);
  });

  it('deve retornar null se valor for null ou undefined no parseRowDateTime', () => {
    expect(parseRowDateTime(null)).toBeNull();
    expect(parseRowDateTime(undefined)).toBeNull();
  });

  it('deve retornar null se a string normalizada for vazia no parseRowDateTime', () => {
    expect(parseRowDateTime('   ')).toBeNull();
    expect(parseRowDateTime('<br>')).toBeNull();
  });

  it('deve retornar null se a data de fallback falhar no parseRowDateTime', () => {
    expect(parseRowDateTime('uma string qualquer e maluca sem padrao de data')).toBeNull();
  });

  it('deve retornar null se dateValue for vazio no parseBoundaryDate', () => {
    expect(parseBoundaryDate('', 'start')).toBeNull();
    expect(parseBoundaryDate(undefined, 'end')).toBeNull();
  });

  it('deve retornar null para data invalida no parseBoundaryDate', () => {
    expect(parseBoundaryDate('99-99-9999', 'start')).toBeNull();
  });

  it('deve validar limites exatos no shouldIncludeRowByDate', () => {
    // A data bate perfeitamente com 'from'
    expect(shouldIncludeRowByDate('2026-04-15 00:00:00', { from: '2026-04-15' })).toBe(true);
    // A data é menor que from (deve falhar)
    expect(shouldIncludeRowByDate('2026-04-14 23:59:59', { from: '2026-04-15' })).toBe(false);

    // A data bate perfeitamente com 'to'
    expect(shouldIncludeRowByDate('2026-04-15 23:59:59', { to: '2026-04-15' })).toBe(true);
    // A data é maior que to (deve falhar)
    expect(shouldIncludeRowByDate('2026-04-16 00:00:00', { to: '2026-04-15' })).toBe(false);
  });
});
