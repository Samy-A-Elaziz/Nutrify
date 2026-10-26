function navigateTo(viewId) {
    const views = document.querySelectorAll('.page-view');
    views.forEach(view => view.classList.remove('active'));

    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));

    const targetView = document.getElementById(`view-${viewId}`);
    if (targetView) {
        targetView.classList.add('active');
    }

    const targetNav = document.getElementById(`nav-${viewId}`);
    if (targetNav) {
        targetNav.classList.add('active');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    document.getElementById('navLinks').classList.remove('show');
}

document.getElementById('mobileMenuBtn').addEventListener('click', function() {
    document.getElementById('navLinks').classList.toggle('show');
});

document.getElementById('currentYear').textContent = new Date().getFullYear();
