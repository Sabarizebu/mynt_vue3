<template>
    <div class="calculator-panel">
        <div class="calculator-display">{{ display }}</div>
        <div class="calculator-buttons">
            <v-btn
                v-for="button in buttons"
                :key="button"
                :color="getButtonColor(button)"
                :variant="getButtonVariant(button)"
                class="calc-btn"
                @click="handleButtonClick(button)"
            >
                {{ button }}
            </v-btn>
        </div>
    </div>
</template>

<script>
import { ref } from 'vue'

export default {
    name: 'CalculatorPanel',
    props: {
        theme: {
            type: String,
            default: 'dark',
        },
    },
    setup() {
        const display = ref('0')
        const previousValue = ref(null)
        const operation = ref(null)
        const waitingForNewValue = ref(false)

        const buttons = [
            'C', '+', '-', '×',
            '7', '8', '9', '/',
            '4', '5', '6', '*',
            '1', '2', '3', '-',
            '0', '.', '=', '+',
        ]

        const getButtonColor = (button) => {
            if (['C', '+', '-', '×', '/', '*', '='].includes(button)) {
                return 'primary'
            }
            return 'default'
        }

        const getButtonVariant = (button) => {
            if (['C', '+', '-', '×', '/', '*', '='].includes(button)) {
                return 'flat'
            }
            return 'text'
        }

        const handleButtonClick = (button) => {
            if (button === 'C') {
                display.value = '0'
                previousValue.value = null
                operation.value = null
                waitingForNewValue.value = false
            } else if (['+', '-', '×', '/', '*'].includes(button)) {
                if (previousValue.value !== null && !waitingForNewValue.value) {
                    calculate()
                }
                previousValue.value = parseFloat(display.value)
                operation.value = button === '×' ? '*' : button
                waitingForNewValue.value = true
            } else if (button === '=') {
                if (previousValue.value !== null) {
                    calculate()
                    previousValue.value = null
                    operation.value = null
                }
            } else {
                if (waitingForNewValue.value) {
                    display.value = button
                    waitingForNewValue.value = false
                } else {
                    if (display.value === '0') {
                        display.value = button
                    } else {
                        display.value += button
                    }
                }
            }
        }

        const calculate = () => {
            const current = parseFloat(display.value)
            let result = previousValue.value

            switch (operation.value) {
                case '+':
                    result += current
                    break
                case '-':
                    result -= current
                    break
                case '*':
                    result *= current
                    break
                case '/':
                    result /= current
                    break
            }

            display.value = result.toString()
        }

        return {
            display,
            buttons,
            getButtonColor,
            getButtonVariant,
            handleButtonClick,
        }
    },
}
</script>

<style scoped>
.calculator-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 8px;
}

.calculator-display {
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 8px 16px;
    font-size: 24px;
    font-weight: 600;
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 4px;
    margin-bottom: 8px;
    overflow: hidden;
}

.calculator-buttons {
    flex: 1;
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 4px;
}

.calc-btn {
    min-width: 0;
    font-size: 16px;
    font-weight: 600;
}
</style>

