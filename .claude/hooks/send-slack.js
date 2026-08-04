#!/usr/bin/env node
/**
 * Slack Webhook 직접 전송기 (stdin JSON → Slack 전송)
 *
 * stdin에서 다음 형식의 JSON을 받음:
 * {
 *   "eventType": "notification|stop",
 *   "hookInput": { hook으로부터 받은 전체 JSON },
 *   "timestamp": "YYYY-MM-DD HH:MM:SS",
 *   "projectName": "프로젝트명",
 *   "webhookUrl": "https://hooks.slack.com/..."
 * }
 *
 * Slack Webhook에 직접 전송 (curl 거치지 않음)
 * Node.js 내부에서 모든 한글 텍스트 조합 및 전송까지 완료
 */

const https = require('https');
const url = require('url');

let inputData = '';
process.stdin.on('data', (chunk) => {
  inputData += chunk.toString('utf8');
});

process.stdin.on('end', () => {
  try {
    const input = JSON.parse(inputData);

    const eventType = input.eventType || 'unknown';
    const hookInput = input.hookInput || {};
    const timestamp = input.timestamp || new Date().toISOString();
    const projectName = input.projectName || 'claude-project';
    const webhookUrl = input.webhookUrl;

    if (!webhookUrl) {
      // Webhook URL 없으면 조용히 종료
      process.exit(0);
    }

    let emoji, username, detail;

    if (eventType === 'notification') {
      emoji = ':bell:';
      username = 'PermissionBot';
      detail = hookInput.message || 'Permission request';
    } else if (eventType === 'stop') {
      emoji = ':white_check_mark:';
      username = 'CompleteBot';
      detail = '세션이 종료되었습니다.';
    } else {
      process.exit(0);
    }

    const sessionId = hookInput.session_id || 'unknown';

    // Slack 메시지 텍스트 조합 (Node.js 내부에서 한글 처리)
    const text = `${emoji} ${projectName} | ${eventType}\n시각: ${timestamp}\n${detail}\n(Session: ${sessionId})`;

    // Slack Webhook payload
    const payload = {
      channel: '#ai-claude',
      username: username,
      text: text
    };

    const payloadJson = JSON.stringify(payload);

    // Slack Webhook URL 파싱
    const parsedUrl = new url.URL(webhookUrl);

    // HTTPS 요청 옵션
    const options = {
      hostname: parsedUrl.hostname,
      path: parsedUrl.pathname + parsedUrl.search,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payloadJson, 'utf8')
      },
      timeout: 5000
    };

    // Slack Webhook으로 전송
    const req = https.request(options, (res) => {
      let responseData = '';

      res.on('data', (chunk) => {
        responseData += chunk;
      });

      res.on('end', () => {
        // Slack 응답 확인 (성공 시 "ok")
        if (responseData === 'ok') {
          process.exit(0);
        } else {
          // 실패는 stderr로만 기록
          console.error(`[send-slack] Slack 전송 실패 (응답: ${responseData})`);
          process.exit(0); // 훅 메커니즘 방해 금지: 항상 0
        }
      });
    });

    req.on('socket', (socket) => {
      socket.setTimeout(5000);
      socket.on('timeout', () => {
        req.destroy();
      });
    });

    req.on('error', (err) => {
      console.error(`[send-slack] Error: ${err.message}`);
      console.error(`[send-slack] Full error:`, err);
      process.exit(0); // 훅 메커니즘 방해 금지
    });

    req.on('timeout', () => {
      req.destroy();
      console.error('[send-slack] 전송 타임아웃');
      process.exit(0); // 훅 메커니즘 방해 금지
    });

    // Payload 전송
    req.write(payloadJson, 'utf8');
    req.end();
  } catch (err) {
    // JSON 파싱 실패는 조용히 처리
    process.exit(0);
  }
});
