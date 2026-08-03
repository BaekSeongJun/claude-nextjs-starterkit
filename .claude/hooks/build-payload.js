#!/usr/bin/env node
/**
 * Slack Webhook payload 생성기 (stdin JSON → stdout JSON)
 *
 * stdin에서 다음 형식의 JSON을 받음:
 * {
 *   "eventType": "notification|stop",
 *   "hookInput": { hook로부터 받은 전체 JSON },
 *   "timestamp": "YYYY-MM-DD HH:MM:SS",
 *   "projectName": "프로젝트명"
 * }
 *
 * stdout으로 Slack Webhook payload JSON을 출력
 * 명령줄 인자에 한글을 전달하지 않으므로 인코딩 손상 우회
 */

const fs = require('fs');

// stdin에서 JSON 읽기 (바이트 스트림으로 완전한 UTF-8 보장)
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

    let emoji, username, detail;

    if (eventType === 'notification') {
      emoji = ':bell:';
      username = 'PermissionBot';
      detail = hookInput.message || 'Permission request';
    } else if (eventType === 'stop') {
      emoji = ':white_check_mark:';
      username = 'CompleteBot';
      detail = 'Session ended.';
    } else {
      process.exit(0);
    }

    const sessionId = hookInput.session_id || 'unknown';

    // Slack message
    const text = `${emoji} ${projectName} | ${eventType}\nTime: ${timestamp}\n${detail}\n(Session: ${sessionId})`;

    // Slack Webhook payload
    const payload = {
      channel: '#ai-claude',
      username: username,
      text: text
    };

    // stdout으로 JSON 출력 (바이트 스트림, 인코딩 손상 없음)
    console.log(JSON.stringify(payload));
  } catch (err) {
    // JSON 파싱 실패는 조용히 처리
    process.exit(0);
  }
});
