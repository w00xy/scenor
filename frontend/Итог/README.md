# Модальное окно настройки узлов

## Описание

Модальное окно для настройки параметров узлов workflow. Открывается при двойном клике на узел.

## Структура

- **NodeConfigModal** - базовый компонент модального окна
- **NodeConfigWrapper** - обёртка, которая выбирает нужный конфиг по типу узла
- **configs/** - компоненты настройки для каждого типа узла

## Поддерживаемые типы узлов

1. **manual_trigger** - ручной триггер (без параметров)
2. **webhook_trigger** - webhook триггер (путь, HTTP метод)
3. **http_request** - HTTP запрос (URL, метод, заголовки, query, body, timeout)
4. **if** - условие (режим AND/OR, список условий)
5. **switch** - переключатель (выражение, варианты)
6. **set** - установка значений (JSON объект)
7. **transform** - трансформация данных (JavaScript код)
8. **code** - выполнение кода (язык, исходный код)
9. **delay** - задержка (миллисекунды)
10. **db_select** - выборка из БД (таблица, условия WHERE)
11. **db_insert** - вставка в БД (таблица, значения)

## Структура модального окна

Каждое модальное окно разделено на 3 зоны:

1. **Вход** - описание входных данных узла
2. **Параметры** - настройки узла (основная зона с формой)
3. **Выход** - описание выходных данных узла

## Использование

```tsx
<NodeConfigWrapper
  isOpen={configModal.isOpen}
  nodeId={configModal.nodeId || ""}
  nodeType={configModal.nodeType || ""}
  nodeData={configModal.nodeData}
  onClose={handleCloseConfigModal}
  onSave={handleSaveNodeConfig}
/>
```

## Интеграция

Модальное окно интегрировано в:
- `WorkflowEditor.tsx` - основной редактор workflow
- `DefaultNode.tsx` - обработчик двойного клика для обычных узлов
- `TriggerNode.tsx` - обработчик двойного клика для триггеров

## Сохранение данных

При нажатии кнопки "Сохранить" данные отправляются через API:
```typescript
await workflowApi.updateNode(workflowId, nodeId, {
  configJson: config,
});
```
