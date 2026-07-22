document.addEventListener('DOMContentLoaded', () => {
    // Profile entrance
    setTimeout(() => {
        document.getElementById('profileSection').classList.add('visible');
    }, 200);

    // Separator
    setTimeout(() => {
        document.getElementById('separator').classList.add('visible');
    }, 500);

    // Staggered link entrance
    const links = document.querySelectorAll('.p5-link');
    links.forEach((link, i) => {
        setTimeout(() => {
            link.classList.add('visible');
        }, 600 + i * 100);
    });

    // Footer
    setTimeout(() => {
        document.getElementById('footer').classList.add('visible');
    }, 600 + links.length * 100 + 200);
});
