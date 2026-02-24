// Generate dynamic stars background
function generateStars() {
    const container = document.getElementById('stars-container');
    const numStars = 100;

    for (let i = 0; i < numStars; i++) {
        const star = document.createElement('div');
        star.classList.add('star');

        // Random positioning
        const x = Math.random() * 100;
        const y = Math.random() * 100;

        // Random size
        const size = Math.random() * 3;

        // Random animation duration and delay
        const duration = Math.random() * 3 + 1;
        const delay = Math.random() * 5;

        star.style.left = `${x}%`;
        star.style.top = `${y}%`;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDuration = `${duration}s`;
        star.style.animationDelay = `${delay}s`;

        container.appendChild(star);
    }
}

// Calculator Logic Class
class Calculator {
    constructor(previousOperandTextElement, currentOperandTextElement) {
        this.previousOperandTextElement = previousOperandTextElement;
        this.currentOperandTextElement = currentOperandTextElement;
        this.clear();
    }

    clear() {
        this.currentOperand = '0';
        this.previousOperand = '';
        this.operation = undefined;
        this.shouldResetScreen = false;
    }

    delete() {
        if (this.currentOperand === 'Error' || this.currentOperand === '0') return;

        if (this.currentOperand.length === 1 || (this.currentOperand.length === 2 && this.currentOperand.startsWith('-'))) {
            this.currentOperand = '0';
        } else {
            this.currentOperand = this.currentOperand.toString().slice(0, -1);
        }
    }

    appendNumber(number) {
        if (this.currentOperand === 'Error') this.clear();

        if (this.shouldResetScreen) {
            this.currentOperand = '';
            this.shouldResetScreen = false;
        }

        if (number === '.' && this.currentOperand.includes('.')) return;

        if (this.currentOperand === '0' && number !== '.') {
            this.currentOperand = number.toString();
        } else {
            this.currentOperand = this.currentOperand.toString() + number.toString();
        }

        // Add punch effect for visual feedback
        this.triggerDisplayAnimation();
    }

    chooseOperation(operation) {
        if (this.currentOperand === 'Error') return;
        if (this.currentOperand === '0' && this.previousOperand === '') return;

        if (this.previousOperand !== '') {
            this.compute();
        }

        // Special case handling the ÷ and × symbols from UI to actual math
        let actualOp = operation;
        if (operation === '×') actualOp = '*';
        if (operation === '÷') actualOp = '/';
        if (operation === '−') actualOp = '-';
        if (operation === '+') actualOp = '+';


        this.operation = actualOp;
        this.previousOperand = this.currentOperand;
        this.shouldResetScreen = true;
    }

    compute() {
        let computation;
        const prev = parseFloat(this.previousOperand);
        const current = parseFloat(this.currentOperand);

        if (isNaN(prev) || isNaN(current)) return;

        switch (this.operation) {
            case '+':
                computation = prev + current;
                break;
            case '-':
                computation = prev - current;
                break;
            case '*':
                computation = prev * current;
                break;
            case '/':
                if (current === 0) {
                    this.currentOperand = 'Error';
                    this.operation = undefined;
                    this.previousOperand = '';
                    return;
                }
                computation = prev / current;
                break;
            default:
                return;
        }

        // Handle floating point precision issues
        computation = Math.round(computation * 100000000) / 100000000;

        this.currentOperand = computation.toString();
        this.operation = undefined;
        this.previousOperand = '';
        this.shouldResetScreen = true;

        this.triggerDisplayAnimation();
    }

    getDisplayNumber(number) {
        if (number === 'Error') return 'Error';

        const stringNumber = number.toString();
        const integerDigits = parseFloat(stringNumber.split('.')[0]);
        const decimalDigits = stringNumber.split('.')[1];

        let integerDisplay;
        if (isNaN(integerDigits)) {
            integerDisplay = '';
        } else {
            integerDisplay = integerDigits.toLocaleString('en', { maximumFractionDigits: 0 });
        }

        if (decimalDigits != null) {
            return `${integerDisplay}.${decimalDigits}`;
        } else {
            return integerDisplay;
        }
    }

    updateDisplay() {
        this.currentOperandTextElement.innerText = this.getDisplayNumber(this.currentOperand);

        if (this.operation != null) {
            // Map back to display symbols
            let displayOp = this.operation;
            if (displayOp === '*') displayOp = '×';
            if (displayOp === '/') displayOp = '÷';
            if (displayOp === '-') displayOp = '−';

            this.previousOperandTextElement.innerText = `${this.getDisplayNumber(this.previousOperand)} ${displayOp}`;
        } else {
            this.previousOperandTextElement.innerText = '';
        }
    }

    triggerDisplayAnimation() {
        this.currentOperandTextElement.classList.remove('punch');
        // Trigger reflow
        void this.currentOperandTextElement.offsetWidth;
        this.currentOperandTextElement.classList.add('punch');
    }
}

// Initialization and Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    generateStars();

    const numberButtons = document.querySelectorAll('[data-number]');
    const operationButtons = document.querySelectorAll('[data-operator]');
    const equalsButton = document.querySelector('[data-action="calculate"]');
    const deleteButton = document.querySelector('[data-action="delete"]');
    const allClearButton = document.querySelector('[data-action="clear-all"]');
    const previousOperandTextElement = document.getElementById('previous-operand');
    const currentOperandTextElement = document.getElementById('current-operand');

    const calculator = new Calculator(previousOperandTextElement, currentOperandTextElement);

    numberButtons.forEach(button => {
        button.addEventListener('click', () => {
            // trigger button press animation
            button.classList.add('pressed');
            setTimeout(() => button.classList.remove('pressed'), 150);

            calculator.appendNumber(button.innerText);
            calculator.updateDisplay();
        });
    });

    operationButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.classList.add('pressed');
            setTimeout(() => button.classList.remove('pressed'), 150);

            calculator.chooseOperation(button.innerText);
            calculator.updateDisplay();
        });
    });

    equalsButton.addEventListener('click', button => {
        equalsButton.classList.add('pressed');
        setTimeout(() => equalsButton.classList.remove('pressed'), 150);

        calculator.compute();
        calculator.updateDisplay();
    });

    allClearButton.addEventListener('click', button => {
        allClearButton.classList.add('pressed');
        setTimeout(() => allClearButton.classList.remove('pressed'), 150);

        calculator.clear();
        calculator.updateDisplay();
    });

    deleteButton.addEventListener('click', button => {
        deleteButton.classList.add('pressed');
        setTimeout(() => deleteButton.classList.remove('pressed'), 150);

        calculator.delete();
        calculator.updateDisplay();
    });

    // Keyboard support
    document.addEventListener('keydown', e => {
        let key = e.key;

        // Prevent default behavior for enter (submitting forms) and slash (quick search)
        if (key === 'Enter' || key === '/') {
            e.preventDefault();
        }

        // Map keyboard keys to logical operations
        if (/[0-9.]/.test(key)) {
            calculator.appendNumber(key);
            calculator.updateDisplay();
            visuallyClickButton(`[data-number="${key}"]`);
        }
        if (key === '*') {
            calculator.chooseOperation('×');
            calculator.updateDisplay();
            visuallyClickButton(`[data-operator="×"]`);
        }
        if (key === '/') {
            calculator.chooseOperation('÷');
            calculator.updateDisplay();
            visuallyClickButton(`[data-operator="÷"]`);
        }
        if (key === '-') {
            calculator.chooseOperation('−');
            calculator.updateDisplay();
            visuallyClickButton(`[data-operator="−"]`);
        }
        if (key === '+') {
            calculator.chooseOperation('+');
            calculator.updateDisplay();
            visuallyClickButton(`[data-operator="+"]`);
        }
        if (key === 'Enter' || key === '=') {
            calculator.compute();
            calculator.updateDisplay();
            visuallyClickButton('[data-action="calculate"]');
        }
        if (key === 'Backspace') {
            calculator.delete();
            calculator.updateDisplay();
            visuallyClickButton('[data-action="delete"]');
        }
        if (key === 'Escape') {
            calculator.clear();
            calculator.updateDisplay();
            visuallyClickButton('[data-action="clear-all"]');
        }
    });

    // Helper for keyboard visual feedback
    function visuallyClickButton(selector) {
        const button = document.querySelector(selector);
        if (button) {
            button.classList.add('pressed');
            setTimeout(() => button.classList.remove('pressed'), 150);

            // Simulate hover state temporarily
            const originalBackground = button.style.background;
            button.style.background = 'rgba(255, 255, 255, 0.2)';
            setTimeout(() => {
                button.style.background = originalBackground;
            }, 150);
        }
    }
});
