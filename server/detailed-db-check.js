const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function detailedDatabaseCheck() {
  try {
    console.log('=== 상세 데이터베이스 테이블 확인 ===\n');

    // 모든 테이블의 레코드 수 확인
    const tableCounts = {
      users: await prisma.users.count(),
      workspaces: await prisma.workspaces.count(),
      workspace_documents: await prisma.workspace_documents.count(),
      workspace_chats: await prisma.workspace_chats.count(),
      workspace_threads: await prisma.workspace_threads.count(),
      system_settings: await prisma.system_settings.count(),
      api_keys: await prisma.api_keys.count(),
      invites: await prisma.invites.count(),
      embed_configs: await prisma.embed_configs.count(),
      embed_chats: await prisma.embed_chats.count(),
      event_logs: await prisma.event_logs.count(),
      cache_data: await prisma.cache_data.count()
    };

    console.log('📊 테이블별 레코드 수:');
    Object.entries(tableCounts).forEach(([table, count]) => {
      console.log(`  ${table}: ${count}개`);
    });

    console.log('\n🔍 상세 데이터 확인:');

    // 워크스페이스 상세 정보
    console.log('\n1. 워크스페이스 상세 정보:');
    const workspaces = await prisma.workspaces.findMany({
      include: {
        workspace_users: {
          include: {
            users: {
              select: { username: true, role: true }
            }
          }
        },
        documents: {
          select: { filename: true, createdAt: true }
        }
      }
    });

    workspaces.forEach(workspace => {
      console.log(`\n  📁 워크스페이스: ${workspace.name} (ID: ${workspace.id})`);
      console.log(`     슬러그: ${workspace.slug}`);
      console.log(`     생성일: ${workspace.createdAt}`);
      console.log(`     채팅 모델: ${workspace.chatModel || 'N/A'}`);
      console.log(`     채팅 제공자: ${workspace.chatProvider || 'N/A'}`);
      console.log(`     사용자 수: ${workspace.workspace_users.length}명`);
      console.log(`     문서 수: ${workspace.documents.length}개`);
      
      if (workspace.workspace_users.length > 0) {
        console.log(`     사용자 목록:`);
        workspace.workspace_users.forEach(wu => {
          console.log(`       - ${wu.users.username} (${wu.users.role})`);
        });
      }
    });

    // 시스템 설정 상세 정보
    console.log('\n2. 시스템 설정 상세 정보:');
    const settings = await prisma.system_settings.findMany();
    settings.forEach(setting => {
      console.log(`  ⚙️  ${setting.label}: ${setting.value || 'N/A'}`);
    });

    // 최근 채팅 기록
    console.log('\n3. 최근 채팅 기록 (최근 3개):');
    const recentChats = await prisma.workspace_chats.findMany({
      include: {
        users: {
          select: { username: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    });

    recentChats.forEach(chat => {
      const promptPreview = chat.prompt.length > 100 ? chat.prompt.substring(0, 100) + '...' : chat.prompt;
      const responsePreview = chat.response.length > 100 ? chat.response.substring(0, 100) + '...' : chat.response;
      console.log(`\n  💬 채팅 ID: ${chat.id}`);
      console.log(`     워크스페이스 ID: ${chat.workspaceId}`);
      console.log(`     사용자: ${chat.users?.username || 'Anonymous'}`);
      console.log(`     프롬프트: ${promptPreview}`);
      console.log(`     응답: ${responsePreview}`);
      console.log(`     생성일: ${chat.createdAt}`);
    });

    // API 키 정보
    console.log('\n4. API 키 정보:');
    const apiKeys = await prisma.api_keys.findMany();
    if (apiKeys.length > 0) {
      apiKeys.forEach(key => {
        console.log(`  🔑 API 키 ID: ${key.id}`);
        console.log(`     생성일: ${key.createdAt}`);
        console.log(`     마지막 업데이트: ${key.lastUpdatedAt}`);
      });
    } else {
      console.log('  🔑 등록된 API 키가 없습니다.');
    }

    // 임베드 설정 정보
    console.log('\n5. 임베드 설정 정보:');
    const embedConfigs = await prisma.embed_configs.findMany({
      include: {
        workspace: {
          select: { name: true }
        }
      }
    });
    
    if (embedConfigs.length > 0) {
      embedConfigs.forEach(config => {
        console.log(`\n  🌐 임베드 설정 ID: ${config.id}`);
        console.log(`     워크스페이스: ${config.workspace.name}`);
        console.log(`     활성화: ${config.enabled ? '예' : '아니오'}`);
        console.log(`     채팅 모드: ${config.chat_mode}`);
        console.log(`     메시지 제한: ${config.message_limit || '무제한'}`);
      });
    } else {
      console.log('  🌐 등록된 임베드 설정이 없습니다.');
    }

  } catch (error) {
    console.error('❌ 데이터베이스 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

detailedDatabaseCheck();
