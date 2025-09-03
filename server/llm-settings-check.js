const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkLLMSettings() {
  try {
    console.log('=== LLM 설정 및 관련 설정 값 확인 ===\n');

    // 1. 시스템 설정 확인
    console.log('1. 🔧 시스템 설정:');
    const systemSettings = await prisma.system_settings.findMany();
    systemSettings.forEach(setting => {
      console.log(`   ${setting.label}: ${setting.value || 'N/A'}`);
    });

    // 2. 워크스페이스별 LLM 설정 확인
    console.log('\n2. 🤖 워크스페이스별 LLM 설정:');
    const workspaces = await prisma.workspaces.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        chatProvider: true,
        chatModel: true,
        openAiTemp: true,
        openAiHistory: true,
        openAiPrompt: true,
        agentProvider: true,
        agentModel: true,
        similarityThreshold: true,
        topN: true,
        chatMode: true,
        vectorSearchMode: true,
        queryRefusalResponse: true,
        createdAt: true
      }
    });

    workspaces.forEach(workspace => {
      console.log(`\n   📁 워크스페이스: ${workspace.name} (ID: ${workspace.id})`);
      console.log(`      슬러그: ${workspace.slug}`);
      console.log(`      채팅 제공자: ${workspace.chatProvider || 'N/A'}`);
      console.log(`      채팅 모델: ${workspace.chatModel || 'N/A'}`);
      console.log(`      에이전트 제공자: ${workspace.agentProvider || 'N/A'}`);
      console.log(`      에이전트 모델: ${workspace.agentModel || 'N/A'}`);
      console.log(`      온도 (Temperature): ${workspace.openAiTemp || 'N/A'}`);
      console.log(`      히스토리 제한: ${workspace.openAiHistory || 'N/A'}`);
      console.log(`      시스템 프롬프트: ${workspace.openAiPrompt ? (workspace.openAiPrompt.length > 100 ? workspace.openAiPrompt.substring(0, 100) + '...' : workspace.openAiPrompt) : 'N/A'}`);
      console.log(`      유사도 임계값: ${workspace.similarityThreshold || 'N/A'}`);
      console.log(`      Top N: ${workspace.topN || 'N/A'}`);
      console.log(`      채팅 모드: ${workspace.chatMode || 'N/A'}`);
      console.log(`      벡터 검색 모드: ${workspace.vectorSearchMode || 'N/A'}`);
      console.log(`      쿼리 거부 응답: ${workspace.queryRefusalResponse ? (workspace.queryRefusalResponse.length > 100 ? workspace.queryRefusalResponse.substring(0, 100) + '...' : workspace.queryRefusalResponse) : 'N/A'}`);
      console.log(`      생성일: ${workspace.createdAt}`);
    });

    // 3. API 키 정보 확인
    console.log('\n3. 🔑 API 키 정보:');
    const apiKeys = await prisma.api_keys.findMany();
    if (apiKeys.length > 0) {
      apiKeys.forEach(key => {
        console.log(`   API 키 ID: ${key.id}`);
        console.log(`   생성일: ${key.createdAt}`);
        console.log(`   마지막 업데이트: ${key.lastUpdatedAt}`);
        console.log(`   생성자 ID: ${key.createdBy || 'N/A'}`);
        console.log('');
      });
    } else {
      console.log('   등록된 API 키가 없습니다.');
    }

    // 4. 임베드 설정 확인
    console.log('\n4. 🌐 임베드 설정:');
    const embedConfigs = await prisma.embed_configs.findMany({
      include: {
        workspace: {
          select: { name: true }
        }
      }
    });
    
    if (embedConfigs.length > 0) {
      embedConfigs.forEach(config => {
        console.log(`\n   임베드 설정 ID: ${config.id}`);
        console.log(`   워크스페이스: ${config.workspace.name}`);
        console.log(`   활성화: ${config.enabled ? '예' : '아니오'}`);
        console.log(`   채팅 모드: ${config.chat_mode}`);
        console.log(`   허용 도메인: ${config.allowlist_domains || 'N/A'}`);
        console.log(`   모델 오버라이드 허용: ${config.allow_model_override ? '예' : '아니오'}`);
        console.log(`   온도 오버라이드 허용: ${config.allow_temperature_override ? '예' : '아니오'}`);
        console.log(`   프롬프트 오버라이드 허용: ${config.allow_prompt_override ? '예' : '아니오'}`);
        console.log(`   일일 최대 채팅 수: ${config.max_chats_per_day || '무제한'}`);
        console.log(`   세션당 최대 채팅 수: ${config.max_chats_per_session || '무제한'}`);
        console.log(`   메시지 제한: ${config.message_limit || '무제한'}`);
      });
    } else {
      console.log('   등록된 임베드 설정이 없습니다.');
    }

    // 5. 시스템 프롬프트 변수 확인
    console.log('\n5. 📝 시스템 프롬프트 변수:');
    const promptVariables = await prisma.system_prompt_variables.findMany();
    if (promptVariables.length > 0) {
      promptVariables.forEach(variable => {
        console.log(`\n   변수 키: ${variable.key}`);
        console.log(`   값: ${variable.value || 'N/A'}`);
        console.log(`   설명: ${variable.description || 'N/A'}`);
        console.log(`   타입: ${variable.type}`);
        console.log(`   사용자 ID: ${variable.userId || '시스템'}`);
      });
    } else {
      console.log('   등록된 시스템 프롬프트 변수가 없습니다.');
    }

    // 6. 프롬프트 히스토리 확인
    console.log('\n6. 📚 프롬프트 히스토리 (최근 5개):');
    const promptHistory = await prisma.prompt_history.findMany({
      include: {
        workspace: {
          select: { name: true }
        },
        user: {
          select: { username: true }
        }
      },
      orderBy: { modifiedAt: 'desc' },
      take: 5
    });

    if (promptHistory.length > 0) {
      promptHistory.forEach(history => {
        const promptPreview = history.prompt.length > 100 ? history.prompt.substring(0, 100) + '...' : history.prompt;
        console.log(`\n   워크스페이스: ${history.workspace.name}`);
        console.log(`   수정자: ${history.user?.username || 'Anonymous'}`);
        console.log(`   프롬프트: ${promptPreview}`);
        console.log(`   수정일: ${history.modifiedAt}`);
      });
    } else {
      console.log('   프롬프트 히스토리가 없습니다.');
    }

    // 7. 이벤트 로그에서 LLM 관련 이벤트 확인
    console.log('\n7. 📊 LLM 관련 이벤트 로그 (최근 10개):');
    const eventLogs = await prisma.event_logs.findMany({
      where: {
        event: {
          contains: 'llm'
        }
      },
      orderBy: { occurredAt: 'desc' },
      take: 10
    });

    if (eventLogs.length > 0) {
      eventLogs.forEach(log => {
        console.log(`\n   이벤트: ${log.event}`);
        console.log(`   메타데이터: ${log.metadata || 'N/A'}`);
        console.log(`   사용자 ID: ${log.userId || 'N/A'}`);
        console.log(`   발생일: ${log.occurredAt}`);
      });
    } else {
      console.log('   LLM 관련 이벤트 로그가 없습니다.');
    }

    // 8. 설정 요약
    console.log('\n8. 📋 LLM 설정 요약:');
    console.log(`   총 워크스페이스 수: ${workspaces.length}`);
    console.log(`   채팅 제공자 설정된 워크스페이스: ${workspaces.filter(w => w.chatProvider).length}`);
    console.log(`   에이전트 제공자 설정된 워크스페이스: ${workspaces.filter(w => w.agentProvider).length}`);
    console.log(`   API 키 수: ${apiKeys.length}`);
    console.log(`   임베드 설정 수: ${embedConfigs.length}`);
    console.log(`   시스템 프롬프트 변수 수: ${promptVariables.length}`);

  } catch (error) {
    console.error('❌ LLM 설정 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkLLMSettings();
