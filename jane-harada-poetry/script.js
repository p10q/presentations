document.addEventListener('DOMContentLoaded', () => {
    const toc = document.getElementById('toc');
    const poemViewer = document.getElementById('poem-viewer');
    const tocBtn = document.getElementById('toc-btn');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageNumber = document.querySelector('.page-number');
    const sideToc = document.getElementById('side-toc');
    const closeTocBtn = document.getElementById('close-toc');
    const sideTocLinks = document.querySelectorAll('.side-toc-list a');
    const downloadLink = document.querySelector('.download-link');

    const poems = document.querySelectorAll('.poem');
    const tocLinks = document.querySelectorAll('.toc-list a');

    let currentPoemIndex = 0;
    const totalPoems = poems.length;

    // Start reading when clicking any TOC link on main page

    // Table of contents button - now opens side modal
    tocBtn.addEventListener('click', () => {
        sideToc.classList.add('open');
        updateSideTocActiveState();
    });

    // Close side TOC
    closeTocBtn.addEventListener('click', () => {
        sideToc.classList.remove('open');
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
        if (sideToc.classList.contains('open') &&
            !sideToc.contains(e.target) &&
            e.target !== tocBtn) {
            sideToc.classList.remove('open');
        }
    });

    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        if (currentPoemIndex > 0) {
            navigatePoem(currentPoemIndex - 1, 'right');
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPoemIndex < totalPoems - 1) {
            navigatePoem(currentPoemIndex + 1, 'left');
        }
    });

    // TOC links
    tocLinks.forEach((link, index) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showPoemViewer();
            showPoem(index);
        });
    });

    // Side TOC links
    sideTocLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const poemIndex = parseInt(link.dataset.poem);
            showPoem(poemIndex);
            sideToc.classList.remove('open');
        });
    });

    // Contents header acts as home link
    const contentsHome = document.getElementById('contents-home');
    if (contentsHome) {
        contentsHome.addEventListener('click', () => {
            sideToc.classList.remove('open');
            showTableOfContents();
        });
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (poemViewer.classList.contains('hidden')) return;

        switch(e.key) {
            case 'ArrowLeft':
                if (currentPoemIndex > 0) {
                    navigatePoem(currentPoemIndex - 1, 'right');
                }
                break;
            case 'ArrowRight':
                if (currentPoemIndex < totalPoems - 1) {
                    navigatePoem(currentPoemIndex + 1, 'left');
                }
                break;
            case 'Escape':
                showTableOfContents();
                break;
        }
    });

    // Touch/swipe navigation for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    poemViewer.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    poemViewer.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0 && currentPoemIndex < totalPoems - 1) {
                // Swipe left - next poem
                navigatePoem(currentPoemIndex + 1, 'left');
            } else if (diff < 0 && currentPoemIndex > 0) {
                // Swipe right - previous poem
                navigatePoem(currentPoemIndex - 1, 'right');
            }
        }
    }

    function showPoemViewer() {
        toc.style.display = 'none';
        poemViewer.classList.remove('hidden');
        poemViewer.style.opacity = '0';

        setTimeout(() => {
            poemViewer.style.opacity = '1';
        }, 50);
    }

    function showTableOfContents() {
        poemViewer.style.opacity = '0';

        setTimeout(() => {
            poemViewer.classList.add('hidden');
            toc.style.display = 'block';
            toc.style.opacity = '0';

            setTimeout(() => {
                toc.style.opacity = '1';
            }, 50);
        }, 300);
    }

    function showPoem(index) {
        // Hide all poems
        poems.forEach(poem => {
            poem.classList.remove('active', 'exit-left', 'exit-right');
        });

        // Show selected poem
        poems[index].classList.add('active');
        currentPoemIndex = index;
        updateNavigation();
    }

    function navigatePoem(newIndex, exitDirection) {
        const currentPoem = poems[currentPoemIndex];
        const newPoem = poems[newIndex];

        // Add exit animation to current poem
        currentPoem.classList.add(`exit-${exitDirection}`);

        // After exit animation, show new poem
        setTimeout(() => {
            currentPoem.classList.remove('active', 'exit-left', 'exit-right');
            newPoem.classList.add('active');
            currentPoemIndex = newIndex;
            updateNavigation();
        }, 300);
    }

    function updateNavigation() {
        // Update page number
        pageNumber.textContent = `${currentPoemIndex + 1} / ${totalPoems}`;

        // Update button states
        prevBtn.disabled = currentPoemIndex === 0;
        nextBtn.disabled = currentPoemIndex === totalPoems - 1;

        // Update active state in side TOC
        updateSideTocActiveState();

        // Smooth scroll to top for new poem
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function updateSideTocActiveState() {
        sideTocLinks.forEach((link, index) => {
            if (index === currentPoemIndex) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // Preload fonts for better performance
    document.fonts.ready.then(() => {
        document.body.classList.add('fonts-loaded');
    });

    // Add subtle parallax effect on scroll
    let ticking = false;
    function updateParallax() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.poem-text');

        parallaxElements.forEach(element => {
            const speed = 0.5;
            const yPos = -(scrolled * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });

        ticking = false;
    }

    function requestTick() {
        if (!ticking) {
            window.requestAnimationFrame(updateParallax);
            ticking = true;
        }
    }

    window.addEventListener('scroll', requestTick);

    // Show/hide download link based on scroll position
    function checkScrollForDownload() {
        if (!poemViewer.classList.contains('hidden')) return; // Only show on TOC page

        const scrollHeight = document.documentElement.scrollHeight;
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const clientHeight = window.innerHeight;
        const scrolledToBottom = scrollHeight - scrollTop - clientHeight < 100;

        if (scrolledToBottom) {
            downloadLink.classList.add('visible');
        } else {
            downloadLink.classList.remove('visible');
        }
    }

    window.addEventListener('scroll', checkScrollForDownload);
    checkScrollForDownload(); // Check initial state

    // Progressive enhancement: Add page flip sound (optional)
    function playPageTurnSound() {
        // This is where you could add an audio element for page turn sounds
        // For now, we'll keep it silent for a minimalist experience
    }


    // Add smooth fade-in for images and text
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe poem elements
    poems.forEach(poem => {
        observer.observe(poem);
    });

    // Add ambient cursor effect
    const cursor = document.createElement('div');
    cursor.className = 'cursor-effect';
    document.body.appendChild(cursor);

    let cursorTimeout;
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
        cursor.style.opacity = '0.1';

        clearTimeout(cursorTimeout);
        cursorTimeout = setTimeout(() => {
            cursor.style.opacity = '0';
        }, 1000);
    });
});

// Add CSS for cursor effect dynamically
const style = document.createElement('style');
style.textContent = `
    .cursor-effect {
        position: fixed;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(135, 147, 111, 0.2) 0%, transparent 70%);
        pointer-events: none;
        transform: translate(-50%, -50%);
        transition: opacity 0.3s ease;
        z-index: 9999;
        mix-blend-mode: multiply;
    }

    .fonts-loaded {
        transition: opacity 0.3s ease;
    }

    .fade-in {
        animation: fadeIn 0.6s ease forwards;
    }

`;
document.head.appendChild(style);