/**
 * Main Application Bootstrapper
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize MVVM Stack
    const dashboardVM = new DashboardViewModel();
    const appView = new AppView(dashboardVM);

    // Global reference for inline event handlers
    window.appView = appView;
});