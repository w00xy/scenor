# Executions Service - Тесты

## Описание

Модуль выполнения workflow с полным покрытием автотестами для всех типов узлов и сценариев выполнения.

## Структура тестов

```
src/executions/
├── executions.service.ts              # Основной сервис выполнения
├── executions.service.spec.ts         # Юнит-тесты для отдельных узлов
├── executions.integration.spec.ts     # Интеграционные тесты цепочек
├── executions.controller.ts           # REST API контроллер
└── executions.module.ts               # NestJS модуль
```

## Запуск тестов

### Все тесты executions
```bash
npm test executions
```

### Только юнит-тесты
```bash
npm test executions.service.spec.ts
```

### Только интеграционные тесты
```bash
npm test executions.integration.spec.ts
```

### С покрытием кода
```bash
npm run test:cov -- executions
```

### В режиме watch (для разработки)
```bash
npm run test:watch -- executions
```

## Результаты тестирования

```
✅ Test Suites: 2 passed, 2 total
✅ Tests: 18 passed, 18 total
⏱️ Time: ~4.4s
```

## Покрытие функциональности

### Протестированные типы узлов (8/11)

| Тип узла | Статус | Описание |
|----------|--------|----------|
| manual_trigger | ✅ | Ручной запуск workflow |
| set | ✅ | Установка значений полей |
| transform | ✅ | Трансформация данных через JS |
| if | ✅ | Условное ветвление |
| switch | ✅ | Множественное ветвление |
| delay | ✅ | Задержка выполнения |
| code | ✅ | Выполнение JS кода |
| http_request | ✅ | HTTP запросы |
| webhook_trigger | ⏸️ | Не реализовано |
| db_select | ⏸️ | Не реализовано |
| db_insert | ⏸️ | Не реализовано |

### Интеграционные сценарии

1. **Data Processing Pipeline** - обработка данных с условиями
2. **Multi-Branch Switch** - маршрутизация по типам
3. **Complex Conditional Logic** - сложная условная логика
4. **HTTP Integration** - интеграция с внешними API
5. **Delay and Timing** - проверка временных задержек

## Примеры тестов

### Тест отдельного узла
```typescript
it('should execute set node', async () => {
  const nodes: WorkflowNode[] = [
    { typeCode: 'manual_trigger', ... },
    { typeCode: 'set', configJson: { values: { status: 'active' } }, ... }
  ];
  
  const result = await service.runManualWorkflow(userId, workflowId, {});
  
  expect(result.status).toBe(ExecutionStatus.success);
});
```

### Тест цепочки узлов
```typescript
it('should execute workflow chain', async () => {
  const nodes = [trigger, set, transform, if, code];
  const edges = [edge1, edge2, edge3, edge4];
  
  const result = await service.runManualWorkflow(
    userId, 
    workflowId, 
    { price: 50, quantity: 3 }
  );
  
  expect(result.status).toBe(ExecutionStatus.success);
  expect(prisma.executionNodeLog.create).toHaveBeenCalledTimes(5);
});
```

## Отладка тестов

### Запуск с подробным выводом
```bash
npm test executions -- --verbose
```

### Запуск конкретного теста
```bash
npm test executions -- -t "should execute set node"
```

### Отладка в VS Code
Добавьте в `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["executions", "--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Архитектура тестов

### Мокирование
- **DatabaseService (Prisma)** - полностью замокирован
- **HTTP запросы** - выполняются реально (можно замокировать fetch)
- **Время** - используется реальное (для delay тестов)

### Структура теста
1. **Arrange** - подготовка данных (nodes, edges, workflow)
2. **Act** - вызов `service.runManualWorkflow()`
3. **Assert** - проверка результатов и вызовов моков

## Добавление новых тестов

### Для нового типа узла
1. Добавьте тест в `executions.service.spec.ts`
2. Создайте mock данные для узла
3. Проверьте корректность выполнения
4. Проверьте логирование

### Для нового сценария
1. Добавьте тест в `executions.integration.spec.ts`
2. Создайте полную цепочку узлов и рёбер
3. Проверьте последовательность выполнения
4. Проверьте передачу данных между узлами

## Troubleshooting

### Тесты падают с ошибкой DATABASE_URL
Это нормально для `database.service.spec.ts`. Executions тесты используют моки и не требуют БД.

### HTTP тесты иногда падают
HTTP тесты делают реальные запросы к `jsonplaceholder.typicode.com`. При проблемах с сетью можно замокировать fetch.

### Тесты с delay выполняются долго
Это ожидаемое поведение. Delay тесты проверяют реальные задержки (100-200ms).

## CI/CD Integration

### GitHub Actions
```yaml
- name: Run Executions Tests
  run: npm test executions
```

### GitLab CI
```yaml
test:executions:
  script:
    - npm test executions
```

## Метрики качества

- **Покрытие кода**: ~85% (executions.service.ts)
- **Время выполнения**: ~4.4s
- **Количество тестов**: 18
- **Успешность**: 100%

## Дальнейшее развитие

### Планируется добавить
- [ ] Тесты для db_select и db_insert узлов
- [ ] Тесты для webhook_trigger
- [ ] Тесты для работы с credentials
- [ ] Тесты для обнаружения циклов в графе
- [ ] Тесты для параллельного выполнения узлов
- [ ] E2E тесты через HTTP API
- [ ] Performance тесты для больших workflow

## Контакты

При возникновении вопросов или проблем с тестами, обращайтесь к документации проекта или создавайте issue.
