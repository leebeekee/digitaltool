document.addEventListener('DOMContentLoaded', () => {
    // Add simple interactive effects usually
    const cards = document.querySelectorAll('.menu-link');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.setProperty('--x', `${x}px`);
            card.style.setProperty('--y', `${y}px`);
        });
    });
    
    // Log for debugging
    console.log('Digital Tool Navigation Loaded');
});
