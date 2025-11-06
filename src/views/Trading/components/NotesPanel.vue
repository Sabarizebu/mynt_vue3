<template>
    <div class="notes-panel">
        <div class="notes-content">
            <div
                v-for="(note, index) in notes"
                :key="index"
                class="note-item"
                :class="note.checked ? 'checked' : ''"
            >
                <v-checkbox
                    v-model="note.checked"
                    density="compact"
                    hide-details
                    class="note-checkbox"
                ></v-checkbox>
                <div class="note-text">{{ note.text }}</div>
            </div>
        </div>
        <div class="notes-input">
            <v-text-field
                v-model="newNote"
                placeholder="Add a note..."
                density="compact"
                variant="outlined"
                hide-details
                @keyup.enter="addNote"
            >
                <template v-slot:append>
                    <v-btn icon="mdi-plus" size="small" variant="text" @click="addNote"></v-btn>
                </template>
            </v-text-field>
        </div>
    </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'

export default {
    name: 'NotesPanel',
    props: {
        theme: {
            type: String,
            default: 'dark',
        },
    },
    setup() {
        const notes = ref([])
        const newNote = ref('')

        const addNote = () => {
            if (!newNote.value.trim()) return
            notes.value.push({
                text: newNote.value.trim(),
                checked: false,
            })
            newNote.value = ''
            saveNotes()
        }

        const saveNotes = () => {
            try {
                localStorage.setItem('trading_notes', JSON.stringify(notes.value))
            } catch (error) {
                console.error('Error saving notes:', error)
            }
        }

        const loadNotes = () => {
            try {
                const saved = localStorage.getItem('trading_notes')
                if (saved) {
                    notes.value = JSON.parse(saved)
                } else {
                    // Default notes
                    notes.value = [
                        { text: 'Buy low, sell high', checked: false },
                        { text: 'Make profit', checked: false },
                        { text: 'Set stop losses. Be disciplined', checked: false },
                        { text: "Don't overtrade", checked: false },
                        { text: 'Take breaks', checked: false },
                    ]
                }
            } catch (error) {
                console.error('Error loading notes:', error)
            }
        }

        watch(notes, () => {
            saveNotes()
        }, { deep: true })

        onMounted(() => {
            loadNotes()
        })

        return {
            notes,
            newNote,
            addNote,
        }
    },
}
</script>

<style scoped>
.notes-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 8px;
}

.notes-content {
    flex: 1;
    overflow-y: auto;
    margin-bottom: 8px;
}

.note-item {
    display: flex;
    align-items: center;
    padding: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.note-item.checked .note-text {
    text-decoration: line-through;
    opacity: 0.6;
}

.note-checkbox {
    flex-shrink: 0;
    margin-right: 8px;
}

.note-text {
    flex: 1;
    font-size: 13px;
}

.notes-input {
    flex-shrink: 0;
}
</style>

