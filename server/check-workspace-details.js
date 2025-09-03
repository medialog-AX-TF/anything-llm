const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkWorkspaceDetails() {
  try {
    console.log('=== 워크스페이스 상세 설정 확인 ===\n');

    // 1. anthropic-claude-sonnet-4 워크스페이스 상세 정보
    console.log('1. 📁 anthropic-claude-sonnet-4 워크스페이스 상세 정보:');
    const anthropicWorkspace = await prisma.workspaces.findFirst({
      where: {
        name: { contains: 'anthropic' }
      }
    });

    if (anthropicWorkspace) {
      console.log(`   워크스페이스 ID: ${anthropicWorkspace.id}`);
      console.log(`   이름: ${anthropicWorkspace.name}`);
      console.log(`   슬러그: ${anthropicWorkspace.slug}`);
      console.log(`   생성일: ${anthropicWorkspace.createdAt}`);
      console.log(`   마지막 업데이트: ${anthropicWorkspace.lastUpdatedAt}`);
      
      console.log('\n   🤖 LLM 설정:');
      console.log(`   채팅 제공자: ${anthropicWorkspace.chatProvider || 'N/A'}`);
      console.log(`   채팅 모델: ${anthropicWorkspace.chatModel || 'N/A'}`);
      console.log(`   에이전트 제공자: ${anthropicWorkspace.agentProvider || 'N/A'}`);
      console.log(`   에이전트 모델: ${anthropicWorkspace.agentModel || 'N/A'}`);
      
      console.log('\n   ⚙️ 파라미터 설정:');
      console.log(`   온도 (Temperature): ${anthropicWorkspace.openAiTemp || 'N/A'}`);
      console.log(`   히스토리 제한: ${anthropicWorkspace.openAiHistory || 'N/A'}`);
      console.log(`   유사도 임계값: ${anthropicWorkspace.similarityThreshold || 'N/A'}`);
      console.log(`   Top N: ${anthropicWorkspace.topN || 'N/A'}`);
      console.log(`   채팅 모드: ${anthropicWorkspace.chatMode || 'N/A'}`);
      console.log(`   벡터 검색 모드: ${anthropicWorkspace.vectorSearchMode || 'N/A'}`);
      
      if (anthropicWorkspace.openAiPrompt) {
        console.log('\n   📝 시스템 프롬프트:');
        console.log(`   ${anthropicWorkspace.openAiPrompt}`);
      }
      
      if (anthropicWorkspace.queryRefusalResponse) {
        console.log('\n   🚫 쿼리 거부 응답:');
        console.log(`   ${anthropicWorkspace.queryRefusalResponse}`);
      }
    } else {
      console.log('   anthropic-claude-sonnet-4 워크스페이스를 찾을 수 없습니다.');
    }

    // 2. 이 워크스페이스의 채팅 기록 확인
    console.log('\n2. 💬 anthropic-claude-sonnet-4 워크스페이스 채팅 기록:');
    if (anthropicWorkspace) {
      const chats = await prisma.workspace_chats.findMany({
        where: {
          workspaceId: anthropicWorkspace.id
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      });

      console.log(`   총 ${chats.length}개의 채팅 기록:`);
      chats.forEach(chat => {
        const promptPreview = chat.prompt.length > 100 ? chat.prompt.substring(0, 100) + '...' : chat.prompt;
        const responsePreview = chat.response.length > 100 ? chat.response.substring(0, 100) + '...' : chat.response;
        console.log(`\n   채팅 ID: ${chat.id}`);
        console.log(`   프롬프트: ${promptPreview}`);
        console.log(`   응답: ${responsePreview}`);
        console.log(`   생성일: ${chat.createdAt}`);
        console.log(`   API 세션 ID: ${chat.api_session_id || 'N/A'}`);
      });
    }

    // 3. 이 워크스페이스의 스레드 확인
    console.log('\n3. 🧵 anthropic-claude-sonnet-4 워크스페이스 스레드:');
    if (anthropicWorkspace) {
      const threads = await prisma.workspace_threads.findMany({
        where: {
          workspace_id: anthropicWorkspace.id
        }
      });

      console.log(`   총 ${threads.length}개의 스레드:`);
      threads.forEach(thread => {
        console.log(`\n   스레드 ID: ${thread.id}`);
        console.log(`   이름: ${thread.name}`);
        console.log(`   슬러그: ${thread.slug}`);
        console.log(`   생성일: ${thread.createdAt}`);
        console.log(`   사용자 ID: ${thread.user_id || 'N/A'}`);
      });
    }

    // 4. 이 워크스페이스의 이벤트 로그 확인
    console.log('\n4. 📊 anthropic-claude-sonnet-4 워크스페이스 관련 이벤트:');
    const workspaceEvents = await prisma.event_logs.findMany({
      where: {
        metadata: {
          contains: 'anthropic-claude-sonnet-4'
        }
      },
      orderBy: { occurredAt: 'desc' },
      take: 10
    });

    console.log(`   총 ${workspaceEvents.length}개의 관련 이벤트:`);
    workspaceEvents.forEach(event => {
      console.log(`\n   이벤트: ${event.event}`);
      console.log(`   발생일: ${event.occurredAt}`);
      console.log(`   사용자 ID: ${event.userId || 'N/A'}`);
      console.log(`   메타데이터: ${event.metadata || 'N/A'}`);
    });

    // 5. API 키와의 연결 확인
    console.log('\n5. 🔑 API 키 연결 정보:');
    const apiKeys = await prisma.api_keys.findMany();
    console.log(`   총 ${apiKeys.length}개의 API 키:`);
    apiKeys.forEach(key => {
      console.log(`\n   API 키 ID: ${key.id}`);
      console.log(`   생성일: ${key.createdAt}`);
      console.log(`   마지막 업데이트: ${key.lastUpdatedAt}`);
      console.log(`   생성자 ID: ${key.createdBy || 'N/A'}`);
      console.log(`   Secret 존재: ${key.secret ? '예' : '아니오'}`);
    });

    // 6. 요약
    console.log('\n6. 📋 요약:');
    if (anthropicWorkspace) {
      const chatCount = await prisma.workspace_chats.count({
        where: { workspaceId: anthropicWorkspace.id }
      });
      const threadCount = await prisma.workspace_threads.count({
        where: { workspace_id: anthropicWorkspace.id }
      });
      
      console.log(`   워크스페이스 ID: ${anthropicWorkspace.id}`);
      console.log(`   채팅 기록 수: ${chatCount}`);
      console.log(`   스레드 수: ${threadCount}`);
      console.log(`   관련 이벤트 수: ${workspaceEvents.length}`);
      console.log(`   API 키 수: ${apiKeys.length}`);
    }

  } catch (error) {
    console.error('❌ 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkWorkspaceDetails();
