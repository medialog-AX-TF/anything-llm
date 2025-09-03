const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkAPIData() {
  try {
    console.log('=== API 응답 데이터 확인 ===\n');

    // 1. API 키 정보 확인 (Bearer 토큰 관련)
    console.log('1. 🔑 API 키 정보:');
    const apiKeys = await prisma.api_keys.findMany();
    apiKeys.forEach(key => {
      console.log(`\n   API 키 ID: ${key.id}`);
      console.log(`   생성일: ${key.createdAt}`);
      console.log(`   마지막 업데이트: ${key.lastUpdatedAt}`);
      console.log(`   생성자 ID: ${key.createdBy || 'N/A'}`);
      // 실제 secret은 보안상 표시하지 않음
      console.log(`   Secret 존재: ${key.secret ? '예' : '아니오'}`);
    });

    // 2. 워크스페이스에서 anthropic-claude-sonnet-4 모델 사용 확인
    console.log('\n2. 🤖 anthropic-claude-sonnet-4 모델 사용 현황:');
    const workspaces = await prisma.workspaces.findMany({
      where: {
        OR: [
          { chatModel: { contains: 'anthropic' } },
          { chatModel: { contains: 'claude' } },
          { chatModel: { contains: 'sonnet' } },
          { agentModel: { contains: 'anthropic' } },
          { agentModel: { contains: 'claude' } },
          { agentModel: { contains: 'sonnet' } }
        ]
      }
    });

    if (workspaces.length > 0) {
      workspaces.forEach(workspace => {
        console.log(`\n   워크스페이스: ${workspace.name} (ID: ${workspace.id})`);
        console.log(`   채팅 모델: ${workspace.chatModel || 'N/A'}`);
        console.log(`   에이전트 모델: ${workspace.agentModel || 'N/A'}`);
        console.log(`   채팅 제공자: ${workspace.chatProvider || 'N/A'}`);
        console.log(`   에이전트 제공자: ${workspace.agentProvider || 'N/A'}`);
      });
    } else {
      console.log('   anthropic-claude-sonnet-4 모델을 사용하는 워크스페이스가 없습니다.');
    }

    // 3. 모든 워크스페이스의 모델 정보 확인
    console.log('\n3. 📋 모든 워크스페이스 모델 정보:');
    const allWorkspaces = await prisma.workspaces.findMany({
      select: {
        id: true,
        name: true,
        chatModel: true,
        agentModel: true,
        chatProvider: true,
        agentProvider: true
      }
    });

    allWorkspaces.forEach(workspace => {
      console.log(`\n   워크스페이스: ${workspace.name} (ID: ${workspace.id})`);
      console.log(`   채팅 모델: ${workspace.chatModel || 'N/A'}`);
      console.log(`   에이전트 모델: ${workspace.agentModel || 'N/A'}`);
      console.log(`   채팅 제공자: ${workspace.chatProvider || 'N/A'}`);
      console.log(`   에이전트 제공자: ${workspace.agentProvider || 'N/A'}`);
    });

    // 4. 이벤트 로그에서 모델 관련 이벤트 확인
    console.log('\n4. 📊 모델 관련 이벤트 로그:');
    const modelEvents = await prisma.event_logs.findMany({
      where: {
        OR: [
          { event: { contains: 'model' } },
          { event: { contains: 'llm' } },
          { event: { contains: 'provider' } },
          { metadata: { contains: 'anthropic' } },
          { metadata: { contains: 'claude' } },
          { metadata: { contains: 'sonnet' } }
        ]
      },
      orderBy: { occurredAt: 'desc' },
      take: 10
    });

    if (modelEvents.length > 0) {
      modelEvents.forEach(event => {
        console.log(`\n   이벤트: ${event.event}`);
        console.log(`   발생일: ${event.occurredAt}`);
        console.log(`   사용자 ID: ${event.userId || 'N/A'}`);
        console.log(`   메타데이터: ${event.metadata || 'N/A'}`);
      });
    } else {
      console.log('   모델 관련 이벤트 로그가 없습니다.');
    }

    // 5. 시스템 설정에서 모델 관련 설정 확인
    console.log('\n5. ⚙️ 시스템 설정 (모델 관련):');
    const modelSettings = await prisma.system_settings.findMany({
      where: {
        OR: [
          { label: { contains: 'model' } },
          { label: { contains: 'llm' } },
          { label: { contains: 'provider' } },
          { value: { contains: 'anthropic' } },
          { value: { contains: 'claude' } },
          { value: { contains: 'sonnet' } }
        ]
      }
    });

    if (modelSettings.length > 0) {
      modelSettings.forEach(setting => {
        console.log(`\n   설정: ${setting.label}`);
        console.log(`   값: ${setting.value || 'N/A'}`);
      });
    } else {
      console.log('   모델 관련 시스템 설정이 없습니다.');
    }

    // 6. API URL 정보 확인 (partner.novamsg.org:5004 관련)
    console.log('\n6. 🌐 API URL 관련 정보:');
    const urlEvents = await prisma.event_logs.findMany({
      where: {
        OR: [
          { metadata: { contains: 'novamsg' } },
          { metadata: { contains: '5004' } },
          { metadata: { contains: 'partner' } }
        ]
      },
      orderBy: { occurredAt: 'desc' },
      take: 5
    });

    if (urlEvents.length > 0) {
      urlEvents.forEach(event => {
        console.log(`\n   이벤트: ${event.event}`);
        console.log(`   발생일: ${event.occurredAt}`);
        console.log(`   메타데이터: ${event.metadata || 'N/A'}`);
      });
    } else {
      console.log('   API URL 관련 이벤트가 없습니다.');
    }

    // 7. 요약 정보
    console.log('\n7. 📋 요약:');
    console.log(`   총 API 키 수: ${apiKeys.length}`);
    console.log(`   총 워크스페이스 수: ${allWorkspaces.length}`);
    console.log(`   anthropic/claude 모델 사용 워크스페이스: ${workspaces.length}`);
    console.log(`   모델 관련 이벤트 수: ${modelEvents.length}`);
    console.log(`   모델 관련 시스템 설정 수: ${modelSettings.length}`);

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAPIData();
