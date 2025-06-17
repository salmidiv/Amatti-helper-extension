document.addEventListener("click", (event) => {
   const classList = event.target.classList;
  switch (true) {
    case classList.contains("calculateColumnMean"):
      calculateColumnMean();
      break;
  }
})

function calculateColumnMean() {
    const table = document.getElementById("transfer");
    const rows = table.getElementsByTagName('tr');
    
    // Start from 1 if you have a header row, 0 if no header
    for (let i = 1; i < rows.length; i++) {
        const cells = rows[i].getElementsByTagName('td');
        
        // Check if cells exist (columns 8, 9, 10 correspond to index 7, 8, 9)
        if (cells.length >= 10) {
            // Parse values as numbers, handle potential non-numeric values
            const col8 = parseFloat(cells[8].textContent) || 0;
            const col9 = parseFloat(cells[9].textContent) || 0;
            
            // Calculate mean
            const mean = (col8 + col9) / 2;
            
            // Update column 10 (index 9)
            cells[10].textContent = mean.toFixed(2); // 2 decimal places
        }
    }
}

