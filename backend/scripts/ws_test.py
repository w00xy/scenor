import asyncio, json, websockets, requests, time

TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJjOWY2NGY4ZC1mMTA3LTQ5ZGItYTBmYy04OWYxM2RhZWYzMzMiLCJyb2xlIjoiU1VQRVJfQURNSU4iLCJ0eXBlIjoiYWNjZXNzIiwiaWF0IjoxNzc5MDQwMzM1LCJleHAiOjE3NzkwNDIxMzV9.HG-AFSbw8bUnFXwcziD9crfCh0xYBMlkjJhP2W0e1eM'
BASE = 'http://127.0.0.1:3010'
WF_ID = '83bf136c-1acf-4165-a8f6-cfd7893a562b'
WS_URL = 'ws://127.0.0.1:3010/executions?token=' + TOKEN

async def test():
    events = []
    async with websockets.connect(WS_URL) as ws:
        connected = await ws.recv()
        print('CONNECTED:', connected[:200])

        # Create execution first, then immediately subscribe
        resp = requests.post(f'{BASE}/workflows/{WF_ID}/executions/manual',
            headers={'Authorization': f'Bearer {TOKEN}', 'Content-Type': 'application/json'}, json={})
        ex = resp.json()
        exec_id = ex['id']
        print(f'EXECUTION: {exec_id}, status={ex["status"]}, time={resp.elapsed.total_seconds():.4f}s')

        # Subscribe immediately after getting ID
        await ws.send(json.dumps({'event': 'subscribe-execution', 'data': {'executionId': exec_id}}))
        sub_resp = await ws.recv()
        print('SUBSCRIBED:', sub_resp[:200])

        # Collect all events for up to 5 seconds (delay node takes 1s + overhead)
        deadline = time.time() + 5
        while time.time() < deadline:
            try:
                msg = await asyncio.wait_for(ws.recv(), timeout=0.8)
                parsed = json.loads(msg)
                events.append(parsed)
                short = json.dumps(parsed)
                if len(short) > 300:
                    short = short[:300] + '...'
                print(f'EVENT [{parsed["type"]}]: {short}')
            except asyncio.TimeoutError:
                # Check if execution is complete via REST
                check = requests.get(f'{BASE}/workflows/{WF_ID}/executions/{exec_id}',
                    headers={'Authorization': f'Bearer {TOKEN}'})
                if check.json().get('status') in ('success', 'failed'):
                    print('Execution finished, stopping collection')
                    break

    print(f'\n=== SUMMARY ===')
    print(f'Total events: {len(events)}')
    types = [e['type'] for e in events]
    print(f'Types: {types}')

    exec_updates = [e for e in events if e['type'] == 'execution-update']
    node_logs = [e for e in events if e['type'] == 'node-log']
    print(f'execution-update count: {len(exec_updates)}')
    print(f'node-log count: {len(node_logs)}')

    for eu in exec_updates:
        d = eu.get('data', {})
        print(f'  execution-update: status={d.get("status")}, completedNodes={d.get("completedNodes")}, totalNodes={d.get("totalNodes")}')

    for nl in node_logs:
        n = nl.get('nodeLog', {})
        m = nl.get('nodeMeta', {})
        print(f'  node-log: nodeId={n.get("nodeId")}, status={n.get("status")}, nodeName={m.get("nodeName")}, nodeType={m.get("nodeType")}')

    has_exec = len(exec_updates) > 0
    has_node = len(node_logs) > 0
    has_meta = any(nl.get('nodeMeta') for nl in node_logs)

    if has_exec and has_node and has_meta:
        print('\n✅ ASYNC EXECUTION + WEBSOCKET + NODE-META: ALL WORKING')
    elif has_exec and has_node:
        print('\n✅ ASYNC EXECUTION + WEBSOCKET: WORKING (no nodeMeta)')
    elif has_exec:
        print('\n⚠️ execution-update received, node-log missing (workflow too fast?)')
    else:
        print('\n❌ No events received')

asyncio.run(test())
