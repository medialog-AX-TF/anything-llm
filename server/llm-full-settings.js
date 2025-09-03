const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFullLLMSettings() {
  try {
    console.log('=== LLM 전체 설정 정보 ===\n');

    // 워크스페이스 전체 설정 확인
    console.log('1. 워크스페이스 전체 LLM 설정:');
    const workspaces = await prisma.workspaces.findMany();
    
    workspaces.forEach(workspace => {
      console.log(`\n📁 워크스페이스: ${workspace.name} (ID: ${workspace.id})`);
      console.log(`   슬러그: ${workspace.slug}`);
      console.log(`   생성일: ${workspace.createdAt}`);
      
      console.log('\n🤖 LLM 설정:');
      console.log(`   채팅 제공자: ${workspace.chatProvider || 'N/A'}`);
      console.log(`   채팅 모델: ${workspace.chatModel || 'N/A'}`);
      console.log(`   에이전트 제공자: ${workspace.agentProvider || 'N/A'}`);
      console.log(`   에이전트 모델: ${workspace.agentModel || 'N/A'}`);
      
      console.log('\n⚙️ 파라미터 설정:');
      console.log(`   온도 (Temperature): ${workspace.openAiTemp || 'N/A'}`);
      console.log(`   히스토리 제한: ${workspace.openAiHistory || 'N/A'}`);
      console.log(`   유사도 임계값: ${workspace.similarityThreshold || 'N/A'}`);
      console.log(`   Top N: ${workspace.topN || 'N/A'}`);
      console.log(`   채팅 모드: ${workspace.chatMode || 'N/A'}`);
      console.log(`   벡터 검색 모드: ${workspace.vectorSearchMode || 'N/A'}`);
      
      if (workspace.openAiPrompt) {
        console.log('\n📝 시스템 프롬프트:');
        console.log(`   ${workspace.openAiPrompt}`);
      }
      
      if (workspace.queryRefusalResponse) {
        console.log('\n🚫 쿼리 거부 응답:');
        console.log(`   ${workspace.queryRefusalResponse}`);
      }
    });

    // 시스템 설정 상세 확인
    console.log('\n\n2. 시스템 설정:');
    const systemSettings = await prisma.system_settings.findMany();
    systemSettings.forEach(setting => {
      console.log(`   ${setting.label}: ${setting.value || 'N/A'}`);
    });

    // API 키 상세 정보
    console.log('\n\n3. API 키 상세 정보:');
    const apiKeys = await prisma.api_keys.findMany();
    apiKeys.forEach(key => {
      console.log(`\n🔑 API 키 ID: ${key.id}`);
      console.log(`   생성일: ${key.createdAt}`);
      console.log(`   마지막 업데이트: ${key.lastUpdatedAt}`);
      console.log(`   생성자 ID: ${key.createdBy || 'N/A'}`);
    });

    // 이벤트 로그 상세 확인
    console.log('\n\n4. LLM 관련 이벤트 로그:');
    const eventLogs = await prisma.event_logs.findMany({
      where: {
        event: {
          contains: 'llm'
        }
      },
      orderBy: { occurredAt: 'desc' }
    });
    
    eventLogs.forEach(log => {
      console.log(`\n📊 이벤트: ${log.event}`);
      console.log(`   발생일: ${log.occurredAt}`);
      console.log(`   사용자 ID: ${log.userId || 'N/A'}`);
      console.log(`   메타데이터: ${log.metadata || 'N/A'}`);
    });

    // 설정 요약
    console.log('\n\n5. 설정 요약:');
    console.log(`   총 워크스페이스 수: ${workspaces.length}`);
    console.log(`   채팅 제공자 설정된 워크스페이스: ${workspaces.filter(w => w.chatProvider).length}`);
    console.log(`   에이전트 제공자 설정된 워크스페이스: ${workspaces.filter(w => w.agentProvider).length}`);
    console.log(`   API 키 수: ${apiKeys.length}`);
    console.log(`   LLM 관련 이벤트 수: ${eventLogs.length}`);

    // 사용 중인 모델별 통계
    console.log('\n\n6. 모델별 사용 통계:');
    const chatModels = workspaces.filter(w => w.chatModel).map(w => w.chatModel);
    const agentModels = workspaces.filter(w => w.agentModel).map(w => w.agentModel);
    
    console.log('   채팅 모델:');
    const chatModelCount = {};
    chatModels.forEach(model => {
      chatModelCount[model] = (chatModelCount[model] || 0) + 1;
    });
    Object.entries(chatModelCount).forEach(([model, count]) => {
      console.log(`     ${model}: ${count}개 워크스페이스`);
    });
    
    console.log('   에이전트 모델:');
    const agentModelCount = {};
    agentModels.forEach(model => {
      agentModelCount[model] = (agentModelCount[model] || 0) + 1;
    });
    Object.entries(agentModelCount).forEach(([model, count]) => {
      console.log(`     ${model}: ${count}개 워크스페이스`);
    });

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFullLLMSettings();
