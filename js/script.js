// ====================================
// CET Pro Services - Main JavaScript
// ====================================

document.addEventListener('DOMContentLoaded', function() {
    // ====================================
    // DOM Element References
    // ====================================
    const header = document.getElementById('header');
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const langToggle = document.getElementById('langToggle');
    const loadingIndicator = document.getElementById('loading-indicator');
    const contactForm = document.getElementById('contactForm');
    const formFeedback = document.getElementById('form-feedback');

    // ====================================
    // Performance & Throttling Utilities
    // ====================================
    let scrollTicking = false;
    let resizeTicking = false;

    function throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        }
    }

    // ====================================
    // Header Scroll Effects
    // ====================================
    let scrolled = false;
    function handleScroll() {
        const isScrolled = window.scrollY > 50;
        if (isScrolled !== scrolled) {
            scrolled = isScrolled;
            header.classList.toggle('scrolled', scrolled);
        }
    }

    // Throttled scroll listener for performance
    window.addEventListener('scroll', function() {
        if (!scrollTicking) {
            requestAnimationFrame(function() {
                handleScroll();
                updateScrollProgress();
                animateOnScroll();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });

    // ====================================
    // Scroll Progress Indicator
    // ====================================
    function updateScrollProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        if (loadingIndicator) {
            loadingIndicator.style.transform = `scaleX(${Math.min(scrolled / 100, 1)})`;
        }
    }

    // ====================================
    // Mobile Navigation
    // ====================================
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', function() {
            const isExpanded = navLinks.classList.contains('active');
            navLinks.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', !isExpanded);
            
            // Update hamburger icon
            navToggle.innerHTML = !isExpanded ? 
                '<span aria-hidden="true">✕</span>' : 
                '<span aria-hidden="true">☰</span>';
            
            // Prevent body scroll when menu is open
            document.body.style.overflow = !isExpanded ? 'hidden' : 'auto';
            
            // Analytics tracking
            trackEvent('navigation', 'mobile_menu_toggle', { 
                expanded: !isExpanded,
                timestamp: Date.now() 
            });
        });

        // Close mobile nav when clicking outside
        document.addEventListener('click', function(e) {
            if (!navLinks.contains(e.target) && !navToggle.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // Close mobile nav on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                closeMobileMenu();
            }
        });

        function closeMobileMenu() {
            navLinks.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.innerHTML = '<span aria-hidden="true">☰</span>';
            document.body.style.overflow = 'auto';
        }
    }

    // ====================================
    // Language Toggle System
    // ====================================
    if (langToggle) {
        langToggle.addEventListener('click', function() {
            const isSpanish = document.body.classList.contains('show-spanish');
            document.body.classList.toggle('show-spanish');
            
            // Update form options for language
            updateFormLanguage(!isSpanish);
            
            // Update page language attribute
            document.documentElement.lang = !isSpanish ? 'es' : 'en';
            
            // Save language preference
            localStorage.setItem('preferred-language', !isSpanish ? 'spanish' : 'english');
            
            // Analytics tracking
            trackEvent('language_toggle', 'click', { 
                language: !isSpanish ? 'spanish' : 'english',
                timestamp: Date.now()
            });

            // Update page title for SEO
            updatePageTitle(!isSpanish);
        });

        // Load saved language preference
        const savedLanguage = localStorage.getItem('preferred-language');
        if (savedLanguage === 'spanish') {
            document.body.classList.add('show-spanish');
            document.documentElement.lang = 'es';
            updatePageTitle(true);
        }
    }

    // ====================================
    // Language-Specific Functions
    // ====================================
    function updateFormLanguage(isSpanish) {
        const serviceSelect = document.getElementById('service');
        const employeesSelect = document.getElementById('employees');
        
        if (serviceSelect) {
            // Update service options based on current language display
            const options = serviceSelect.querySelectorAll('option[value]');
            options.forEach(option => {
                const value = option.value;
                
                // Map service options to bilingual text
                const serviceMap = {
                    'fractional-cfo': isSpanish ? 'CFO Fraccionado' : 'Fractional CFO',
                    'fractional-controller': isSpanish ? 'Controller Fraccionado' : 'Fractional Controller',
                    'project-management': isSpanish ? 'Gestión de Proyectos' : 'Project Management',
                    'administrative': isSpanish ? 'Apoyo Administrativo' : 'Administrative Support',
                    'comprehensive': isSpanish ? 'Paquete Integral' : 'Comprehensive Package',
                    'consultation': isSpanish ? 'Consulta Gratuita' : 'Free Consultation'
                };
                
                if (serviceMap[value]) {
                    option.textContent = serviceMap[value];
                }
            });
        }
    }

    function updatePageTitle(isSpanish) {
        const newTitle = isSpanish ? 
            'Servicios de CFO Fraccionado | CET Pro Services - Liderazgo Financiero Experto para Empresas en Crecimiento | Wyoming, EE.UU.' :
            'Fractional CFO Services | CET Pro Services - Expert Financial Leadership for Growing Businesses | Wyoming-Based, US & Latin America';
        
        document.title = newTitle;
    }

    // ====================================
    // Smooth Scrolling for Anchor Links
    // ====================================
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            
            if (target) {
                // Close mobile menu if open
                closeMobileMenu();
                
                // Calculate offset for fixed header
                const headerHeight = header ? header.offsetHeight : 80;
                const targetPosition = target.offsetTop - headerHeight - 20;
                
                // Smooth scroll
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });

                // Update URL without jumping
                history.pushState(null, null, targetId);

                // Analytics tracking
                trackEvent('navigation', 'section_click', { 
                    section: targetId.replace('#', ''),
                    timestamp: Date.now()
                });
            }
        });
    });

    // ====================================
    // Enhanced Contact Form Handler
    // ====================================
    if (contactForm && formFeedback) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show loading state
            const submitBtn = this.querySelector('.submit-btn');
            const originalText = submitBtn.innerHTML;
            const isSpanish = document.body.classList.contains('show-spanish');
            
            submitBtn.innerHTML = isSpanish ? 
                '⏳ Enviando...' : 
                '⏳ Sending...';
            submitBtn.disabled = true;
            
            // Get and validate form data
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Enhanced validation
            const errors = validateForm(data, isSpanish);
            if (errors.length > 0) {
                showFormFeedback(errors.join('<br>'), 'error');
                resetSubmitButton(submitBtn, originalText);
                return;
            }

            // Simulate form submission (replace with actual endpoint)
            submitFormData(data).then(success => {
                if (success) {
                    const successMessage = isSpanish 
                        ? '🎉 ¡Gracias por tu consulta! Te contactaremos dentro de 24 horas para agendar tu consulta estratégica gratuita. Revisaremos tus necesidades específicas y prepararemos una propuesta personalizada.'
                        : '🎉 Thank you for your inquiry! We will contact you within 24 hours to schedule your free strategic consultation. We\'ll review your specific needs and prepare a customized proposal.';
                    
                    showFormFeedback(successMessage, 'success');
                    this.reset();
                    
                    // Enhanced analytics tracking
                    trackBusinessLead({
                        company: data.company,
                        employees: data.employees,
                        service: data.service,
                        industry: data.industry,
                        language: isSpanish ? 'spanish' : 'english',
                        timestamp: Date.now()
                    });
                    
                    // Scroll to feedback
                    formFeedback.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                } else {
                    const errorMessage = isSpanish 
                        ? 'Hubo un error al enviar tu mensaje. Por favor intenta de nuevo o contáctanos directamente al (970) 702-8014.'
                        : 'There was an error sending your message. Please try again or contact us directly at (970) 702-8014.';
                    
                    showFormFeedback(errorMessage, 'error');
                }
                
                resetSubmitButton(submitBtn, originalText);
            });
        });

        // Real-time form validation
        const requiredFields = contactForm.querySelectorAll('[required]');
        requiredFields.forEach(field => {
            field.addEventListener('blur', function() {
                validateField(this);
            });
            
            field.addEventListener('input', function() {
                // Clear error state on input
                this.classList.remove('error');
                this.setAttribute('aria-invalid', 'false');
            });
        });
    }

    // ====================================
    // Form Validation Functions
    // ====================================
    function validateForm(data, isSpanish = false) {
        const errors = [];
        
        // Required field validation
        const requiredFields = {
            name: isSpanish ? 'El nombre es requerido' : 'Name is required',
            company: isSpanish ? 'El nombre de la empresa es requerido' : 'Company name is required',
            email: isSpanish ? 'El email es requerido' : 'Email is required',
            employees: isSpanish ? 'El tamaño de la empresa es requerido' : 'Company size is required',
            service: isSpanish ? 'Por favor selecciona un servicio' : 'Please select a service'
        };

        // Check required fields
        Object.keys(requiredFields).forEach(field => {
            if (!data[field]?.trim()) {
                errors.push(requiredFields[field]);
            }
        });

        // Email validation
        if (data.email && !isValidEmail(data.email)) {
            errors.push(isSpanish ? 
                'Por favor ingresa un email válido' : 
                'Please enter a valid email address'
            );
        }

        // Phone validation (if provided)
        if (data.phone && data.phone.trim() && !isValidPhone(data.phone)) {
            errors.push(isSpanish ? 
                'Por favor ingresa un número de teléfono válido' : 
                'Please enter a valid phone number'
            );
        }

        return errors;
    }

    function validateField(field) {
        const isSpanish = document.body.classList.contains('show-spanish');
        const value = field.value.trim();
        let isValid = true;
        let errorMessage = '';

        // Required field check
        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMessage = isSpanish ? 'Este campo es requerido' : 'This field is required';
        }
        
        // Email specific validation
        else if (field.type === 'email' && value && !isValidEmail(value)) {
            isValid = false;
            errorMessage = isSpanish ? 'Email inválido' : 'Invalid email';
        }
        
        // Phone specific validation
        else if (field.type === 'tel' && value && !isValidPhone(value)) {
            isValid = false;
            errorMessage = isSpanish ? 'Teléfono inválido' : 'Invalid phone';
        }

        // Update field appearance
        field.classList.toggle('error', !isValid);
        field.setAttribute('aria-invalid', !isValid);
        
        // Show/hide error message
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!isValid && errorMessage) {
            if (!errorElement) {
                errorElement = document.createElement('div');
                errorElement.className = 'field-error';
                field.parentNode.appendChild(errorElement);
            }
            errorElement.textContent = errorMessage;
        } else if (errorElement) {
            errorElement.remove();
        }

        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        // Allow various phone formats
        const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    function showFormFeedback(message, type) {
        formFeedback.innerHTML = message;
        formFeedback.className = `form-feedback ${type}`;
        formFeedback.classList.remove('hidden');
        
        // Auto-hide success messages after 10 seconds
        if (type === 'success') {
            setTimeout(() => {
                formFeedback.classList.add('hidden');
            }, 10000);
        }
    }

    function resetSubmitButton(button, originalText) {
        button.innerHTML = originalText;
        button.disabled = false;
    }

    // ====================================
    // Form Submission Handler
    // ====================================
    async function submitFormData(data) {
        try {
            // Simulate API call with realistic delay
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // TODO: Replace with actual form submission endpoint
            // const response = await fetch('/api/contact', {
            //     method: 'POST',
            //     headers: {
            //         'Content-Type': 'application/json',
            //     },
            //     body: JSON.stringify(data)
            // });
            // return response.ok;
            
            // For now, simulate success
            console.log('Form submitted:', data);
            return true;
            
        } catch (error) {
            console.error('Form submission error:', error);
            return false;
        }
    }

    // ====================================
    // Scroll Animations
    // ====================================
    function animateOnScroll() {
        const elements = document.querySelectorAll('.service-item, .feature-card, .industry-card, .mission-content');
        const windowHeight = window.innerHeight;
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < windowHeight - elementVisible) {
                element.classList.add('animate-in');
            }
        });
    }

    // Intersection Observer for better performance (if supported)
    if ('IntersectionObserver' in window) {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver(function(entries) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    // Stop observing after animation to improve performance
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe animatable elements
        document.querySelectorAll('.service-item, .feature-card, .industry-card, .mission-content').forEach(item => {
            observer.observe(item);
        });
    }

    // ====================================
    // CTA Button Tracking
    // ====================================
    document.querySelectorAll('.cta-button, .btn-primary, .btn-secondary').forEach(button => {
        button.addEventListener('click', function(e) {
            const buttonText = this.textContent.trim();
            const section = this.closest('section')?.id || 'unknown';
            const isSpanish = document.body.classList.contains('show-spanish');
            
            trackEvent('cta_click', 'button', { 
                text: buttonText,
                location: section,
                language: isSpanish ? 'spanish' : 'english',
                timestamp: Date.now()
            });

            // Phone number click tracking
            if (this.href && this.href.includes('tel:')) {
                trackEvent('phone_click', 'contact', {
                    phone: '970-702-8014',
                    language: isSpanish ? 'spanish' : 'english'
                });
            }
        });
    });

    // ====================================
    // Font Loading Optimization
    // ====================================
    if ('fonts' in document) {
        document.fonts.ready.then(function() {
            document.body.classList.add('font-loaded');
            console.log('Fonts loaded successfully');
        });
    }

    // ====================================
    // Resize Handler
    // ====================================
    window.addEventListener('resize', throttle(function() {
        // Close mobile menu on resize to desktop
        if (window.innerWidth > 768 && navLinks.classList.contains('active')) {
            closeMobileMenu();
        }
        
        // Update scroll progress on resize
        updateScrollProgress();
    }, 250));

    // ====================================
    // Analytics & Tracking Functions
    // ====================================
    function trackEvent(action, category, data = {}) {
        // Google Analytics 4
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                event_category: category,
                event_label: data.text || data.section || '',
                custom_parameter_1: data.language || 'english',
                custom_parameter_2: data.location || '',
                ...data
            });
        }
        
        // Console log for development
        console.log('Analytics Event:', { action, category, data });
        
        // Facebook Pixel (if needed)
        if (typeof fbq !== 'undefined') {
            fbq('trackCustom', action, data);
        }
    }

    function trackBusinessLead(data) {
        // Enhanced lead tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'generate_lead', {
                currency: 'USD',
                value: 1500, // Average engagement value
                business_size: data.employees,
                service_interest: data.service,
                industry_type: data.industry,
                language: data.language,
                company_name: data.company,
                lead_source: 'website_contact_form'
            });
        }

        // Track in Google Analytics as conversion
        if (typeof gtag !== 'undefined') {
            gtag('event', 'conversion', {
                send_to: 'GA_MEASUREMENT_ID/CONVERSION_ID', // Replace with actual conversion ID
                value: 1500,
                currency: 'USD',
                transaction_id: 'lead_' + Date.now()
            });
        }

        console.log('Business Lead Tracked:', data);
    }

    // ====================================
    // Error Handling
    // ====================================
    window.addEventListener('error', function(e) {
        console.error('JavaScript error:', e.error);
        
        // Send to analytics for monitoring
        if (typeof gtag !== 'undefined') {
            gtag('event', 'exception', {
                description: e.error?.message || 'Unknown JavaScript error',
                fatal: false,
                filename: e.filename || 'unknown',
                lineno: e.lineno || 0
            });
        }
    });

    // ====================================
    // Performance Monitoring
    // ====================================
    window.addEventListener('load', function() {
        // Monitor Core Web Vitals
        if ('PerformanceObserver' in window) {
            try {
                // Monitor navigation timing
                const observer = new PerformanceObserver((list) => {
                    list.getEntries().forEach((entry) => {
                        if (entry.entryType === 'navigation') {
                            const loadTime = entry.loadEventEnd - entry.loadEventStart;
                            console.log('Page load time:', loadTime + 'ms');
                            
                            if (typeof gtag !== 'undefined') {
                                gtag('event', 'timing_complete', {
                                    name: 'page_load',
                                    value: Math.round(loadTime)
                                });
                            }
                        }
                    });
                });
                
                observer.observe({type: 'navigation', buffered: true});
            } catch (e) {
                console.log('Performance monitoring not supported');
            }
        }

        // Track page load completion
        trackEvent('page_load', 'performance', {
            load_time: performance.now(),
            timestamp: Date.now()
        });
    });

    // ====================================
    // Accessibility Enhancements
    // ====================================
    
    // Focus management for mobile menu
    function trapFocus(element) {
        const focusableElements = element.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        element.addEventListener('keydown', function(e) {
            if (e.key === 'Tab') {
                if (e.shiftKey) {
                    if (document.activeElement === firstElement) {
                        lastElement.focus();
                        e.preventDefault();
                    }
                } else {
                    if (document.activeElement === lastElement) {
                        firstElement.focus();
                        e.preventDefault();
                    }
                }
            }
        });
    }

    // Apply focus trapping to mobile menu when active
    const mobileMenuObserver = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (navLinks.classList.contains('active')) {
                    trapFocus(navLinks);
                }
            }
        });
    });

    if (navLinks) {
        mobileMenuObserver.observe(navLinks, { attributes: true });
    }

    // ====================================
    // Initial Setup & Page Load
    // ====================================
    
    // Initial animations check
    animateOnScroll();
    
    // Initial scroll progress
    updateScrollProgress();
    
    // Page load analytics
    trackEvent('page_view', 'navigation', {
        page_title: document.title,
        page_location: window.location.href,
        language: document.body.classList.contains('show-spanish') ? 'spanish' : 'english',
        user_agent: navigator.userAgent,
        timestamp: Date.now()
    });

    // Set focus to main content for screen readers
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
        mainContent.setAttribute('tabindex', '-1');
    }

    // Initialize form language if Spanish is pre-selected
    if (document.body.classList.contains('show-spanish')) {
        updateFormLanguage(true);
    }

    console.log('CET Pro Services website initialized successfully');
});

// ====================================
// Service Worker Registration (Optional)
// ====================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('SW registered: ', registration);
            })
            .catch(function(registrationError) {
                console.log('SW registration failed: ', registrationError);
            });
    });
}

// ====================================
// Global Utility Functions
// ====================================

// Utility function to get current language
function getCurrentLanguage() {
    return document.body.classList.contains('show-spanish') ? 'spanish' : 'english';
}

// Utility function to format phone numbers
function formatPhoneNumber(phoneNumber) {
    const cleaned = phoneNumber.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phoneNumber;
}

// Utility function to format currency
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

// Export functions for potential module use
window.CETProServices = {
    getCurrentLanguage,
    formatPhoneNumber,
    formatCurrency,
    trackEvent: window.trackEvent,
    trackBusinessLead: window.trackBusinessLead
};