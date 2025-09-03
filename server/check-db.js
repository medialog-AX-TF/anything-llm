const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== 데이터베이스 테이블 확인 ===\n');

    // 사용자 테이블 확인
    console.log('1. 사용자 테이블 (users):');
    const users = await prisma.users.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true
      }
    });
    console.log(`총 ${users.length}명의 사용자:`);
    users.forEach(user => {
      console.log(`  - ID: ${user.id}, 사용자명: ${user.username || 'N/A'}, 역할: ${user.role}, 생성일: ${user.createdAt}`);
    });

    // 워크스페이스 테이블 확인
    console.log('\n2. 워크스페이스 테이블 (workspaces):');
    const workspaces = await prisma.workspaces.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        createdAt: true
      }
    });
    console.log(`총 ${workspaces.length}개의 워크스페이스:`);
    workspaces.forEach(workspace => {
      console.log(`  - ID: ${workspace.id}, 이름: ${workspace.name}, 슬러그: ${workspace.slug}, 생성일: ${workspace.createdAt}`);
    });

    // 문서 테이블 확인
    console.log('\n3. 문서 테이블 (workspace_documents):');
    const documents = await prisma.workspace_documents.findMany({
      select: {
        id: true,
        filename: true,
        workspaceId: true,
        createdAt: true
      }
    });
    console.log(`총 ${documents.length}개의 문서:`);
    documents.forEach(doc => {
      console.log(`  - ID: ${doc.id}, 파일명: ${doc.filename}, 워크스페이스ID: ${doc.workspaceId}, 생성일: ${doc.createdAt}`);
    });

    // 채팅 테이블 확인
    console.log('\n4. 채팅 테이블 (workspace_chats):');
    const chats = await prisma.workspace_chats.findMany({
      select: {
        id: true,
        workspaceId: true,
        prompt: true,
        createdAt: true
      },
      take: 5 // 최근 5개만 표시
    });
    console.log(`최근 ${chats.length}개의 채팅 (전체 중 일부):`);
    chats.forEach(chat => {
      const promptPreview = chat.prompt.length > 50 ? chat.prompt.substring(0, 50) + '...' : chat.prompt;
      console.log(`  - ID: ${chat.id}, 워크스페이스ID: ${chat.workspaceId}, 프롬프트: ${promptPreview}, 생성일: ${chat.createdAt}`);
    });

    // 시스템 설정 테이블 확인
    console.log('\n5. 시스템 설정 테이블 (system_settings):');
    const settings = await prisma.system_settings.findMany({
      select: {
        id: true,
        label: true,
        value: true
      }
    });
    console.log(`총 ${settings.length}개의 시스템 설정:`);
    settings.forEach(setting => {
      console.log(`  - ID: ${setting.id}, 라벨: ${setting.label}, 값: ${setting.value || 'N/A'}`);
    });

  } catch (error) {
    console.error('데이터베이스 확인 중 오류 발생:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
