Обзор проекта

Я разрабатываю дипломный проект, вдохновлённый n8n.
Это платформа автоматизации рабочих процессов с визуальным редактором, где пользователи могут создавать workflow из узлов (nodes), соединённых рёбрами (edges).

Проект не является полной копией n8n, а представляет собой MVP / упрощённую версию с собственным UI и ограниченным набором функций.
Цель — реализовать чистую архитектуру, которая будет масштабируемой, понятной и подходящей для дипломного проекта.

Технологический стек:

Backend: Nest.js
Язык: TypeScript
ORM: Prisma 7.6.0
База данных: PostgreSQL
Frontend: React + TypeScript
Основная идея продукта

Система позволяет пользователям:

регистрироваться и проходить аутентификацию
создавать проекты
создавать workflow внутри проектов
визуально строить workflow из узлов и связей
делиться workflow с другими пользователями или по публичной ссылке
запускать workflow
просматривать историю выполнения и логи узлов

Workflow представляется как направленный граф:

nodes (узлы) = действия / триггеры / логика / блоки данных
edges (рёбра) = связи между узлами
Архитектурные принципы
1. Workflow — это графы

Workflow представляет собой граф из узлов и рёбер.

2. Узлы — универсальные сущности

Не создавай отдельную таблицу для каждого типа узла.

Правильный подход:

одна таблица для типов узлов
одна таблица для экземпляров узлов в workflow
одна таблица для связей (edges)
специфичные настройки узлов хранятся в JSON/JSONB
3. Runtime-данные должны быть отделены от design-time

Не храни результаты выполнения внутри записей узлов workflow.

Разделяй:

структуру workflow
определения типов узлов
запуски выполнения
логи выполнения узлов
4. Секреты должны быть отделены от конфигурации узла

Учётные данные должны храниться в отдельной таблице, а не внутри конфигурации узла.

Основные доменные сущности хранятся в prisma схемах

Ключевые решения по БД
Зачем нужна node_types

Позволяет:

отображать список узлов на фронтенде
знать категории узлов
хранить дефолтные конфиги
валидировать схемы
легко расширять систему
Почему workflow_nodes универсальная

Все узлы — в одной таблице.
Поведение определяется через type и configJson.

Это лучше, чем:

http_request_nodes
if_nodes
code_nodes
Почему используется configJson

У разных узлов разные настройки → JSON — правильный выбор.

Почему credentials отдельно

Секреты:

токены
пароли
API-ключи

не должны храниться в конфиге узла.

Почему execution отдельно

Разделение:

Design-time:

workflow
nodes
edges

Runtime:

executions
logs
Рекомендуемая backend-архитектура
NodeDefinition

Описание типа узла:

type
displayName
category
inputs
outputs
defaultConfig
schema
supportsCredentials
isTrigger
NodeHandler

Каждый тип узла имеет обработчик:

ManualTriggerNodeHandler
HttpRequestNodeHandler
IfNodeHandler
CodeNodeHandler
NodeRegistry

Центральный реестр:

http_request → HTTP handler  
if → IF handler  
code → Code handler  
Execution Engine

Должен:

загрузить workflow
загрузить узлы и связи
определить порядок выполнения
выбрать handler по node.type
выполнить узел
записать лог
Валидация

Использовать Zod.

Валидация:

при создании узла
при обновлении
перед выполнением
MVP набор узлов

Триггеры:

manual_trigger
webhook_trigger

Логика:

if
switch

Данные:

set
transform

Действия:

http_request
code
delay

База данных:

db_select
db_insert
Модель доступа

Глобальный доступ:

users.globalRole

Доступ к проекту:

project_members.role

Публичный доступ:

workflow_shares
Coding правила

Использовать:

TypeScript
Express
Prisma

Разделять:

routes
controllers
services
repositories
node handlers
validation
Naming

SQL → snake_case
TypeScript → camelCase

Чем должен помогать AI
Prisma schema
миграции
backend-архитектура
execution engine
NodeRegistry
Zod-валидация
DTO
структура проекта
Итог

Это упрощённая платформа автоматизации workflow (аналог n8n).

Ключевые идеи:

workflow = граф
node types = registry
nodes = универсальные
config = JSONB
secrets = отдельно
execution = отдельно