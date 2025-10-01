window.printExamResult = function () {
    // Add debugging to see where this function is being called from
    console.log('printExamResult function called from:', new Error().stack);
    console.log('Current page URL:', window.location.href);
    console.log('Current page title:', document.title);
    
    try {
        // First try to find the print-result-modal
        var printModal = document.querySelector('.print-result-modal');
        
        if (!printModal) {
            // If print-result-modal doesn't exist, try to find any modal with result content
            printModal = document.querySelector('.modal-content') || 
                        document.querySelector('.modal') || 
                        document.querySelector('[class*="result"]') ||
                        document.querySelector('[class*="modal"]');
        }
        
        if (!printModal) {
            console.error('No printable content found. Make sure you are on the correct page with exam results.');
            console.log('Available elements on page:');
            console.log('- Elements with class "modal":', document.querySelectorAll('[class*="modal"]').length);
            console.log('- Elements with class "result":', document.querySelectorAll('[class*="result"]').length);
            console.log('- Elements with class "content":', document.querySelectorAll('[class*="content"]').length);
            
            // Don't show alert on Assessment page - just log the error
            if (window.location.href.includes('/assessment')) {
                console.log('On Assessment page - printing not available here');
                return;
            }
            
            alert('No printable content found. Please make sure you are viewing exam results.');
            return;
        }
        
        console.log('Found printable content:', printModal);
        var printContents = printModal.innerHTML;
        var originalContents = document.body.innerHTML;
        
        // Create a new window for printing
        var printWindow = window.open('', '_blank', 'width=800,height=600');
        printWindow.document.write('<html><head><title>Exam Result</title>');
        printWindow.document.write('<style>');
        printWindow.document.write('body { font-family: Arial, sans-serif; margin: 20px; }');
        printWindow.document.write('.modal-content { border: none; box-shadow: none; }');
        printWindow.document.write('.modal-header, .modal-footer { display: none; }');
        printWindow.document.write('.modal-body { padding: 0; }');
        printWindow.document.write('@media print { body { margin: 0; } }');
        printWindow.document.write('</style></head><body>');
        printWindow.document.write('<div class="print-result-modal">' + printContents + '</div>');
        printWindow.document.write('</body></html>');
        printWindow.document.close();
        
        // Wait for content to load then print
        printWindow.onload = function() {
            printWindow.print();
            printWindow.close();
        };
    } catch (error) {
        console.error('Print error:', error);
        
        // Try to find any content that might be printable
        var printModal = document.querySelector('.print-result-modal') || 
                        document.querySelector('.modal-content') || 
                        document.querySelector('.modal') || 
                        document.querySelector('[class*="result"]');
        
        if (printModal) {
            try {
                var printContents = printModal.innerHTML;
                var originalContents = document.body.innerHTML;
                document.body.innerHTML = '<div class="print-result-modal">' + printContents + '</div>';
                window.print();
                document.body.innerHTML = originalContents;
            } catch (fallbackError) {
                console.error('Fallback print also failed:', fallbackError);
                alert('Printing failed. Please try again or contact support.');
            }
        } else {
            console.error('No printable content found for fallback');
            alert('No printable content found. Please make sure you are viewing exam results.');
        }
    }
}; 