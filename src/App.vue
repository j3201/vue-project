<template>
  <div class="layout-container">
    <aside class="sidebar">
      <div class="logo-area">
        <div class="logo-icon">⚙️</div>
        <h2>工具箱</h2>
      </div>
      <nav class="menu-list">
        <router-link to="/image" active-class="active" exact>
          <span class="icon">🖼️</span>
          <span class="text">图片处理</span>
        </router-link>
        <router-link to="/pdf" active-class="active">
          <span class="icon">📄</span>
          <span class="text">PDF 处理</span>
        </router-link>
        <router-link to="/nav" active-class="active">
          <span class="icon">🧭</span>
          <span class="text">导航图</span>
        </router-link>
        <router-link to="/random" active-class="active">
          <span class="icon">🔢</span>
          <span class="text">数字随机组合</span>
        </router-link>
      </nav>
      <div class="sidebar-footer">
        <p>© 2026 工具箱</p>
      </div>
    </aside>

    <main class="content-body">
      <div class="content-wrapper">
        <router-view />
      </div>
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.sidebar {
  width: 260px;
  flex-shrink: 0;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  border-right: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 4px 0 24px rgba(0, 0, 0, 0.08);
  z-index: 10;
  transition: all 0.3s ease;
}

.logo-area {
  text-align: center;
  padding: 24px 0;
  margin-bottom: 32px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.logo-icon {
  font-size: 48px;
  margin-bottom: 12px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}

.logo-area h2 {
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 1px;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.menu-list a {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  border-radius: 12px;
  color: #4a5568;
  text-decoration: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-size: 15px;
  font-weight: 500;
  position: relative;
  overflow: hidden;
}

.menu-list a::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  width: 0;
  height: 100%;
  background: linear-gradient(90deg, rgba(102, 126, 234, 0.1) 0%, transparent 100%);
  transition: width 0.3s ease;
}

.menu-list a:hover::before {
  width: 100%;
}

.menu-list a .icon {
  font-size: 20px;
  transition: transform 0.3s ease;
}

.menu-list a:hover .icon {
  transform: scale(1.15);
}

.menu-list a.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
  font-weight: 600;
  box-shadow: 0 4px 16px rgba(102, 126, 234, 0.3);
  transform: translateX(4px);
}

.menu-list a.active .icon {
  animation: bounce 0.6s ease;
}

@keyframes bounce {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}

.menu-list a:hover:not(.active) {
  background: rgba(102, 126, 234, 0.08);
  color: #667eea;
  transform: translateX(6px);
}

.sidebar-footer {
  margin-top: auto;
  padding-top: 20px;
  text-align: center;
  font-size: 12px;
  color: #a0aec0;
}

.content-body {
  flex: 1;
  padding: 32px;
  overflow-y: auto;
  background: transparent;
}

.content-wrapper {
  width: 100%;
  min-height: 100%;
  animation: fadeIn 0.5s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 768px) {
  .layout-container {
    flex-direction: column;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    gap: 16px;
  }
  
  .logo-area {
    padding: 0;
    margin: 0;
    border: none;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .logo-icon {
    font-size: 32px;
    margin: 0;
  }
  
  .logo-area h2 {
    font-size: 18px;
  }
  
  .menu-list {
    flex-direction: row;
    flex: 0;
    gap: 6px;
  }
  
  .menu-list a {
    padding: 10px 14px;
    font-size: 13px;
  }
  
  .menu-list a .text {
    display: none;
  }
  
  .sidebar-footer {
    display: none;
  }
  
  .content-body {
    padding: 20px;
  }
}
</style>