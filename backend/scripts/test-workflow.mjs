#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки работы workflows
 * Создает workflow из 4 узлов и запускает его
 */

import fetch from 'node-fetch';

const API_URL = process.env.API_URL || 'http://localhost:3000';

// Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function apiCall(method, endpoint, body = null, token = null) {
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, options);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} - ${JSON.stringify(data)}`);
  }

  return data;
}

async function main() {
  log('\n=== Тестирование Workflow System ===\n', 'cyan');

  let accessToken;
  let userId;
  let projectId;
  let workflowId;
  let nodeIds = {};
  let edgeIds = [];

  try {
    // 1. Регистрация пользователя
    log('1. Регистрация тестового пользователя...', 'blue');
    const timestamp = Date.now();
    const registerData = {
      username: `test_user_${timestamp}`,
      email: `test_${timestamp}@example.com`,
      password: 'Test123456!',
    };

    try {
      const registerResponse = await apiCall('POST', '/users/register', registerData);
      log(`✓ Пользователь зарегистрирован: ${registerResponse.user.email}`, 'green');
    } catch (error) {
      log(`⚠ Пользователь уже существует или ошибка регистрации`, 'yellow');
    }

    // 2. Логин
    log('\n2. Вход в систему...', 'blue');
    const loginResponse = await apiCall('POST', '/users/login', {
      email: registerData.email,
      password: registerData.password,
    });
    accessToken = loginResponse.accessToken;
    userId = loginResponse.user.id;
    log(`✓ Успешный вход. User ID: ${userId}`, 'green');

    // 3. Создание проекта
    log('\n3. Создание проекта...', 'blue');
    const projectResponse = await apiCall(
      'POST',
      '/projects',
      {
        name: `Test Project ${timestamp}`,
        description: 'Проект для тестирования workflow',
      },
      accessToken,
    );
    projectId = projectResponse.id;
    log(`✓ Проект создан: ${projectResponse.name} (ID: ${projectId})`, 'green');

    // 4. Seed node types (если еще не сделано)
    log('\n4. Инициализация типов узлов...', 'blue');
    try {
      await apiCall('POST', '/node-types/seed', null, accessToken);
      log('✓ Типы узлов инициализированы', 'green');
    } catch (error) {
      log('⚠ Типы узлов уже инициализированы', 'yellow');
    }

    // 5. Создание workflow
    log('\n5. Создание workflow...', 'blue');
    const workflowResponse = await apiCall(
      'POST',
      `/projects/${projectId}/workflows`,
      {
        name: `Test Workflow ${timestamp}`,
        description: 'Тестовый workflow из 4 узлов',
        status: 'active',
      },
      accessToken,
    );
    workflowId = workflowResponse.id;
    log(`✓ Workflow создан: ${workflowResponse.name} (ID: ${workflowId})`, 'green');

    // 6. Создание узлов
    log('\n6. Создание узлов workflow...', 'blue');

    // Node 1: Manual Trigger
    log('  - Создание Manual Trigger узла...', 'blue');
    const node1 = await apiCall(
      'POST',
      `/workflows/${workflowId}/nodes`,
      {
        type: 'manual_trigger',
        name: 'Start',
        label: 'Начало',
        posX: 100,
        posY: 100,
        configJson: {},
      },
      accessToken,
    );
    nodeIds.trigger = node1.id;
    log(`  ✓ Manual Trigger создан (ID: ${node1.id})`, 'green');

    // Node 2: Set (устанавливает начальные данные)
    log('  - Создание Set узла...', 'blue');
    const node2 = await apiCall(
      'POST',
      `/workflows/${workflowId}/nodes`,
      {
        type: 'set',
        name: 'Set Data',
        label: 'Установить данные',
        posX: 300,
        posY: 100,
        configJson: {
          values: {
            message: 'Hello from workflow!',
            counter: 42,
            timestamp: new Date().toISOString(),
          },
        },
      },
      accessToken,
    );
    nodeIds.set = node2.id;
    log(`  ✓ Set узел создан (ID: ${node2.id})`, 'green');

    // Node 3: Transform (преобразует данные)
    log('  - Создание Transform узла...', 'blue');
    const node3 = await apiCall(
      'POST',
      `/workflows/${workflowId}/nodes`,
      {
        type: 'transform',
        name: 'Transform',
        label: 'Преобразовать',
        posX: 500,
        posY: 100,
        configJson: {
          script: `
            return {
              ...input,
              message: input.message.toUpperCase(),
              counter: input.counter * 2,
              processed: true
            };
          `,
        },
      },
      accessToken,
    );
    nodeIds.transform = node3.id;
    log(`  ✓ Transform узел создан (ID: ${node3.id})`, 'green');

    // Node 4: Code (финальная обработка)
    log('  - Создание Code узла...', 'blue');
    const node4 = await apiCall(
      'POST',
      `/workflows/${workflowId}/nodes`,
      {
        type: 'code',
        name: 'Final Processing',
        label: 'Финальная обработка',
        posX: 700,
        posY: 100,
        configJson: {
          language: 'javascript',
          source: `
            return {
              result: 'success',
              data: input,
              executedAt: new Date().toISOString(),
              summary: \`Processed message: \${input.message}, Counter: \${input.counter}\`
            };
          `,
        },
      },
      accessToken,
    );
    nodeIds.code = node4.id;
    log(`  ✓ Code узел создан (ID: ${node4.id})`, 'green');

    // 7. Создание связей (edges)
    log('\n7. Создание связей между узлами...', 'blue');

    // Edge 1: Trigger -> Set
    const edge1 = await apiCall(
      'POST',
      `/workflows/${workflowId}/edges`,
      {
        sourceNodeId: nodeIds.trigger,
        targetNodeId: nodeIds.set,
      },
      accessToken,
    );
    edgeIds.push(edge1.id);
    log(`  ✓ Связь создана: Trigger -> Set`, 'green');

    // Edge 2: Set -> Transform
    const edge2 = await apiCall(
      'POST',
      `/workflows/${workflowId}/edges`,
      {
        sourceNodeId: nodeIds.set,
        targetNodeId: nodeIds.transform,
      },
      accessToken,
    );
    edgeIds.push(edge2.id);
    log(`  ✓ Связь создана: Set -> Transform`, 'green');

    // Edge 3: Transform -> Code
    const edge3 = await apiCall(
      'POST',
      `/workflows/${workflowId}/edges`,
      {
        sourceNodeId: nodeIds.transform,
        targetNodeId: nodeIds.code,
      },
      accessToken,
    );
    edgeIds.push(edge3.id);
    log(`  ✓ Связь создана: Transform -> Code`, 'green');

    // 8. Получение графа workflow
    log('\n8. Проверка структуры workflow...', 'blue');
    const graph = await apiCall(
      'GET',
      `/workflows/${workflowId}/graph`,
      null,
      accessToken,
    );
    log(`  ✓ Граф получен: ${graph.nodes.length} узлов, ${graph.edges.length} связей`, 'green');

    // 9. Запуск workflow
    log('\n9. Запуск workflow...', 'blue');
    const executionResponse = await apiCall(
      'POST',
      `/workflows/${workflowId}/executions/manual`,
      {
        inputDataJson: {
          initialValue: 'test',
          startTime: new Date().toISOString(),
        },
      },
      accessToken,
    );
    const executionId = executionResponse.id;
    log(`  ✓ Workflow запущен (Execution ID: ${executionId})`, 'green');
    log(`  Статус: ${executionResponse.status}`, 'cyan');

    // 10. Получение результатов выполнения
    log('\n10. Получение результатов выполнения...', 'blue');
    const execution = await apiCall(
      'GET',
      `/workflows/${workflowId}/executions/${executionId}`,
      null,
      accessToken,
    );
    log(`  ✓ Статус выполнения: ${execution.status}`, 'green');
    log(`  Начало: ${execution.startedAt}`, 'cyan');
    log(`  Завершение: ${execution.finishedAt}`, 'cyan');

    if (execution.outputDataJson) {
      log('\n  Результаты выполнения:', 'cyan');
      console.log(JSON.stringify(execution.outputDataJson, null, 2));
    }

    if (execution.errorMessage) {
      log(`  ⚠ Ошибка: ${execution.errorMessage}`, 'red');
    }

    // 11. Получение логов выполнения
    log('\n11. Получение логов выполнения узлов...', 'blue');
    const logs = await apiCall(
      'GET',
      `/workflows/${workflowId}/executions/${executionId}/logs`,
      null,
      accessToken,
    );
    log(`  ✓ Получено ${logs.length} логов`, 'green');

    logs.forEach((logEntry, index) => {
      const nodeName = Object.keys(nodeIds).find(key => nodeIds[key] === logEntry.nodeId) || 'unknown';
      log(`\n  Лог ${index + 1} (${nodeName}):`, 'cyan');
      log(`    Статус: ${logEntry.status}`, 'cyan');
      log(`    Начало: ${logEntry.startedAt}`, 'cyan');
      log(`    Завершение: ${logEntry.finishedAt}`, 'cyan');
      
      if (logEntry.inputJson) {
        log(`    Вход:`, 'cyan');
        console.log('    ', JSON.stringify(logEntry.inputJson, null, 2).replace(/\n/g, '\n    '));
      }
      
      if (logEntry.outputJson) {
        log(`    Выход:`, 'cyan');
        console.log('    ', JSON.stringify(logEntry.outputJson, null, 2).replace(/\n/g, '\n    '));
      }

      if (logEntry.errorMessage) {
        log(`    ⚠ Ошибка: ${logEntry.errorMessage}`, 'red');
      }
    });

    // Итоговая статистика
    log('\n=== Итоговая статистика ===', 'cyan');
    log(`✓ Пользователь: ${registerData.email}`, 'green');
    log(`✓ Проект ID: ${projectId}`, 'green');
    log(`✓ Workflow ID: ${workflowId}`, 'green');
    log(`✓ Узлов создано: ${Object.keys(nodeIds).length}`, 'green');
    log(`✓ Связей создано: ${edgeIds.length}`, 'green');
    log(`✓ Execution ID: ${executionId}`, 'green');
    log(`✓ Статус выполнения: ${execution.status}`, 'green');
    log(`✓ Логов получено: ${logs.length}`, 'green');

    log('\n=== Тест успешно завершен! ===\n', 'green');

  } catch (error) {
    log(`\n✗ Ошибка: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
