<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="logo-area">
        <h2 class="brand">工具箱</h2>
      </div>
      <nav class="menu-list" aria-label="主导航">
        <router-link to="/image" active-class="active" exact>
          <span class="text">图片处理</span>
        </router-link>
        <router-link to="/pdf" active-class="active">
          <span class="text">PDF 处理</span>
        </router-link>
        <router-link to="/nav" active-class="active">
          <span class="text">导航图</span>
        </router-link>
        <router-link to="/random" active-class="active">
          <span class="text">数字随机组合</span>
        </router-link>
        <router-link to="/stay" active-class="active">
          <span class="text">住宿明细</span>
        </router-link>
      </nav>
    </aside>

    <main class="content-body" role="main">
      <router-view />
    </main>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.layout-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  color: #1f2328;
  background:
    radial-gradient(ellipse at 30% -10%, #fbfbf9 0%, transparent 55%),
    radial-gradient(ellipse at 100% 100%, #d8dee9 0%, transparent 55%),
    linear-gradient(180deg, #f5f6f8 0%, #e5e7eb 100%);
  background-color: #eef1f5;
}

.sidebar {
  width: 240px;
  flex-shrink: 0;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #334155 0%, #1e293b 100%);
  color: #e2e8f0;
  border-right: 1px solid #0f172a;
  position: relative;
}

.logo-area {
  padding: 8px 12px 20px 12px;
  margin-bottom: 8px;
  border-bottom: 1px solid rgba(226, 232, 240, 0.1);
}

.brand {
  font-size: 17px;
  font-weight: 600;
  color: #f8fafc;
  letter-spacing: 0.5px;
  margin: 0;
  position: relative;
  padding-left: 14px;
}

.brand::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  width: 4px;
  height: 18px;
  background: #2563eb;
  border-radius: 2px;
  transform: translateY(-50%);
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
}

.menu-list a {
  display: block;
  padding: 10px 12px;
  border-radius: 6px;
  color: #cbd5e1;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-left: 3px solid transparent;
  transition: background 120ms linear;
}

.menu-list a:hover {
  background: rgba(37, 99, 235, 0.14);
  color: #f1f5f9;
}

.menu-list a.active {
  background: #2563eb;
  color: #ffffff;
}

.menu-list a.active:hover {
  background: #1d4ed8;
}

.content-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  box-shadow:
    inset 8px 0 16px -12px rgba(15, 23, 42, 0.25),
    inset 0 8px 16px -12px rgba(15, 23, 42, 0.15);
}

@media (max-width: 768px) {
  .layout-container {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    padding: 12px 16px;
    flex-direction: row;
    align-items: center;
    gap: 16px;
    border-right: none;
    border-bottom: 1px solid #0f172a;
  }

  .logo-area {
    padding: 0;
    margin: 0;
    border: none;
  }

  .brand {
    font-size: 16px;
  }

  .menu-list {
    flex-direction: row;
    gap: 4px;
  }

  .menu-list a {
    padding: 8px 12px;
    font-size: 13px;
    white-space: nowrap;
  }

  .content-body {
    padding: 16px;
  }
}
</style>
