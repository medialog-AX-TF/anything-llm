const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLLMSettingsSimple() {
  try {
    console.log('=== LLM 설정 확인 ===\n');

    // 1. 시스템 설정
    console.log('1. 시스템 설정:');
    const systemSettings = await prisma.system_settings.findMany();
    systemSettings.forEach(setting => {
      console.log(`   ${setting.label}: ${setting.value || 'N/A'}`);
    });

    console.log('\n2. 워크스페이스 LLM 설정:');
    const workspaces = await prisma.workspaces.findMany({
      select: {
        id: true,
        name: true,
        chatProvider: true,
        chatModel: true,
        openAiTemp: true,
        openAiHistory: true,
        agentProvider: true,
        agentModel: true,
        similarityThreshold: true,
        topN: true,
        chatMode: true
      }
    });

    workspaces.forEach(workspace => {
      console.log(`\n   워크스페이스: ${workspace.name} (ID: ${workspace.id})`);
      console.log(`   채팅 제공자: ${workspace.chatProvider || 'N/A'}`);
      console.log(`   채팅 모델: ${workspace.chatModel || 'N/A'}`);
      console.log(`   에이전트 제공자: ${workspace.agentProvider || 'N/A'}`);
      console.log(`   에이전트 모델: ${workspace.agentModel || 'N/A'}`);
      console.log(`   온도: ${workspace.openAiTemp || 'N/A'}`);
      console.log(`   히스토리 제한: ${workspace.openAiHistory || 'N/A'}`);
      console.log(`   유사도 임계값: ${workspace.similarityThreshold || 'N/A'}`);
      console.log(`   Top N: ${workspace.topN || 'N/A'}`);
      console.log(`   채팅 모드: ${workspace.chatMode || 'N/A'}`);
    });

    console.log('\n3. API 키 정보:');
    const apiKeys = await prisma.api_keys.findMany();
    console.log(`   총 API 키 수: ${apiKeys.length}`);
    apiKeys.forEach(key => {
      console.log(`   API 키 ID: ${key.id}, 생성일: ${key.createdAt}`);
    });

    console.log('\n4. 이벤트 로그 (LLM 관련):');
    const eventLogs = await prisma.event_logs.findMany({
      where: {
        event: {
          contains: 'llm'
        }
      },
      orderBy: { occurredAt: 'desc' },
      take: 5
    });
    
    console.log(`   LLM 관련 이벤트 수: ${eventLogs.length}`);
    eventLogs.forEach(log => {
      console.log(`   이벤트: ${log.event}, 발생일: ${log.occurredAt}`);
    });

  } catch (error) {
    console.error('오류:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLLMSettingsSimple();
