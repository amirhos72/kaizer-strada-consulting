// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');

function toggleMenu() {
    const isOpen = menuToggle.classList.contains('active');
    menuToggle.classList.toggle('active');
    mobileMenu.classList.toggle('active');
    menuToggle.setAttribute('aria-expanded', !isOpen);
    mobileMenu.setAttribute('aria-hidden', isOpen);
    
    document.body.style.overflow = isOpen ? '' : 'hidden';
}

menuToggle?.addEventListener('click', toggleMenu);

document.querySelectorAll('.mobile-nav-link').forEach(link => {
    link.addEventListener('click', () => {
        if (mobileMenu.classList.contains('active')) {
            toggleMenu();
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        toggleMenu();
    }
});

// Header scroll effect & Back to Top Button
const header = document.querySelector('header');
const backToTopBtn = document.getElementById('backToTopBtn');
let lastScrollY = window.scrollY;

const handleScroll = throttle(() => {
    const currentScrollY = window.scrollY;
    
    if (currentScrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    if (currentScrollY > lastScrollY && currentScrollY > 200) {
        header.style.transform = 'translateY(-100%)';
    } else {
        header.style.transform = 'translateY(0)';
    }
    
    lastScrollY = currentScrollY;

    if (window.scrollY > 300) {
        backToTopBtn.classList.add('show');
    } else {
        backToTopBtn.classList.remove('show');
    }
}, 100);

window.addEventListener('scroll', handleScroll);

backToTopBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});


// Active Navigation State
function updateActiveNavigation() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link, .mobile-nav-link');
    const scrollPosition = window.scrollY + 100;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                const linkSection = link.getAttribute('data-section') || link.getAttribute('href')?.substring(1);
                if (linkSection === sectionId) {
                    link.classList.add('active');
                    link.setAttribute('aria-current', 'page');
                } else {
                    link.classList.remove('active');
                    link.removeAttribute('aria-current');
                }
            });
        }
    });
}

const throttledNavUpdate = throttle(updateActiveNavigation, 100);
window.addEventListener('scroll', throttledNavUpdate);

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '#top') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            const headerOffset = 80;
            const elementPosition = targetSection.offsetTop;
            const offsetPosition = elementPosition - headerOffset;
            
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
            history.pushState(null, null, targetId);
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const animationObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('metric-number')) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        }
    });
}, observerOptions);

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.metric-number').forEach(metric => {
        animationObserver.observe(metric);
    });
});

function animateCounter(element) {
    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const start = performance.now();
    
    const updateCounter = (currentTime) => {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(easeOutQuart * target);
        
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target;
        }
    };
    requestAnimationFrame(updateCounter);
}

// Form Validation and Submission
const contactForm = document.getElementById('contactForm');

const validationPatterns = {
    name: { pattern: /^[a-zA-Z\s]{2,50}$/, message: 'Please enter a valid name (2-50 characters, letters only)' },
    email: { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' },
    message: { pattern: /^.{10,500}$/, message: 'Message must be between 10-500 characters' }
};

function validateField(field) {
    const fieldName = field.name;
    const fieldValue = field.value.trim();
    const errorElement = document.getElementById(`${fieldName}-error`);
    
    if (!fieldValue) {
        showError(field, errorElement, 'This field is required');
        return false;
    }
    
    const validation = validationPatterns[fieldName];
    if (validation && !validation.pattern.test(fieldValue)) {
        showError(field, errorElement, validation.message);
        return false;
    }
    
    showSuccess(field, errorElement);
    return true;
}

function showError(field, errorElement, message) {
    field.classList.add('error');
    field.classList.remove('valid');
    field.setAttribute('aria-invalid', 'true');
    errorElement.textContent = message;
    errorElement.classList.add('show');
}

function showSuccess(field, errorElement) {
    field.classList.remove('error');
    field.classList.add('valid');
    field.setAttribute('aria-invalid', 'false');
    errorElement.textContent = '';
    errorElement.classList.remove('show');
}

const formFields = contactForm?.querySelectorAll('input, textarea');
formFields?.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', debounce(() => {
        if (field.classList.contains('error') || field.value.trim()) {
            validateField(field);
        }
    }, 500));
});

function simulateFormSubmission() {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            Math.random() > 0.1 ? resolve() : reject(new Error('Network error'));
        }, 1500);
    });
}

contactForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    let isValid = Array.from(formFields).every(field => validateField(field));
    
    if (!isValid) {
        contactForm.querySelector('.error')?.focus();
        return;
    }
    
    const submitBtn = contactForm.querySelector('.btn-submit');
    const feedbackElement = document.querySelector('.form-feedback');
    
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;
    
    try {
        await simulateFormSubmission();
        feedbackElement.textContent = 'Thank you! Your message has been sent successfully.';
        feedbackElement.className = 'form-feedback success show';
        contactForm.reset();
        formFields.forEach(field => {
            field.classList.remove('valid', 'error');
            field.setAttribute('aria-invalid', 'false');
        });

        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submission', {
                'event_category': 'engagement',
                'event_label': 'contact_form'
            });
        }
    } catch (error) {
        console.error('Form submission error:', error);
        feedbackElement.textContent = 'Sorry, there was an error sending your message. Please try again.';
        feedbackElement.className = 'form-feedback error show';
    } finally {
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
        setTimeout(() => {
            feedbackElement.className = 'form-feedback';
        }, 5000);
    }
});

// Marquee animation logic
const marqueeContent = document.querySelector('.marquee-content');
const testimonialsSection = document.querySelector('.testimonials');
let isMarqueePausedByHover = false;

function setMarqueePlayState(isPaused) {
    const playState = isPaused ? 'paused' : 'running';
    if (marqueeContent) {
        marqueeContent.style.animationPlayState = playState;
    }
}

testimonialsSection?.addEventListener('mouseenter', () => {
    isMarqueePausedByHover = true;
    setMarqueePlayState(true);
});

testimonialsSection?.addEventListener('mouseleave', () => {
    isMarqueePausedByHover = false;
    setMarqueePlayState(false);
});

const observerMarquee = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        const isCurrentlyPaused = (entry.isIntersecting && !isMarqueePausedByHover) ? false : true;
        setMarqueePlayState(isCurrentlyPaused);
    });
});

if (testimonialsSection) {
    observerMarquee.observe(testimonialsSection);
}


// Initialize on Load
window.addEventListener('load', () => {
    document.querySelector('.page-loader')?.classList.add('hidden');
    updateActiveNavigation();
});
