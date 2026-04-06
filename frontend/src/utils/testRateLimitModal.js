// Test script to verify rate limit modal works in production
// Run this in browser console on production to test

// Simulate rate limit event
function testRateLimitModal() {
  console.log('Testing rate limit modal...');

  // Dispatch the rate limit event
  const event = new CustomEvent('rate-limit-hit', {
    detail: {
      message: 'Too many requests. Please try again later.',
      retryAfter: 30
    }
  });

  window.dispatchEvent(event);
  console.log('Rate limit event dispatched');
}

// Check if modal is rendered
function checkModalVisibility() {
  const modalElements = document.querySelectorAll('[role="dialog"]');
  console.log('Found modal elements:', modalElements);

  modalElements.forEach((el, index) => {
    console.log(`Modal ${index}:`, {
      visible: el.offsetWidth > 0 && el.offsetHeight > 0,
      zIndex: window.getComputedStyle(el).zIndex,
      display: window.getComputedStyle(el).display,
      position: window.getComputedStyle(el).position
    });
  });
}

// Test functions available globally
window.testRateLimitModal = testRateLimitModal;
window.checkModalVisibility = checkModalVisibility;

console.log('Rate limit modal test functions loaded. Use:');
console.log('- testRateLimitModal() to trigger the modal');
console.log('- checkModalVisibility() to check if modal is visible');