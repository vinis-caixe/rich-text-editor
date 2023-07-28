import React, { useCallback, useMemo, useState } from 'react'
import { createEditor, Editor } from 'slate'
import { Slate, Editable, withReact} from 'slate-react'
import { withHistory } from 'slate-history' 

const CustomEditor = {
    isBoldMarkActive(editor){
        const marks = Editor.marks(editor)
        return marks ? marks.bold === true : false
    },

    isItalicMarkActive(editor){
        const marks = Editor.marks(editor)
        return marks ? marks.italic === true : false
    },

    toggleBoldMark(editor){
        const isActive = CustomEditor.isBoldMarkActive(editor)
        if(isActive){
            Editor.removeMark(editor, 'bold')
        }
        else{
            Editor.addMark(editor, 'bold', true)
        }
    },

    toggleItalicMark(editor){
        const isActive = CustomEditor.isItalicMarkActive(editor)
        if(isActive){
            Editor.removeMark(editor, 'italic')
        }
        else{
            Editor.addMark(editor, 'italic', true)
        }
    }
}

const App = () => {
    const [editor] = useState(() => withReact(withHistory(createEditor())))

    const initialValue = useMemo(
        () => 
            JSON.parse(localStorage.getItem('content')) || [
                {
                    type: 'paragraph',
                    children: [{ text: 'A line of text in a paragraph.' }],
                },
            ],
        [],
    )

    const renderElement = useCallback(props => {
        switch (props.element.type){
            default:
                return <DefaultEement {...props} />
        }
    }, [])

    const renderLeaf = useCallback(props => {
        return <Leaf {...props} />
    }, [])

    return (
        <Slate 
            editor={editor} 
            initialValue={initialValue}
            onChange={value => {
                const isAstChange = editor.operations.some(
                    op => 'set_selection' !== op.type
                )
                if(isAstChange){
                    const content = JSON.stringify(value)
                    localStorage.setItem('content', content)
                }
            }}
        >
                <div>
                    <button
                        onMouseDown={event => {
                            event.preventDefault()
                            CustomEditor.toggleBoldMark(editor)
                        }}
                    >
                        Bold
                    </button>
                    <button
                        onMouseDown={event => {
                            event.preventDefault()
                            CustomEditor.toggleItalicMark(editor)
                        }}
                    >
                        Italic
                    </button>
                </div>
                <Editable 
                    editor={editor}
                    renderElement={renderElement}
                    renderLeaf={renderLeaf}
                    onKeyDown={event => {
                        if(!event.ctrlKey){
                            return
                        }

                        switch(event.key){

                            case 'b': {
                                event.preventDefault()
                                CustomEditor.toggleBoldMark(editor)
                                break
                            }

                            case 'i': {
                                event.preventDefault()
                                CustomEditor.toggleItalicMark(editor)
                                break
                            }

                            default:
                                
                        }

                    }}
                />
        </Slate>
    )
}

const Leaf = ({ attributes, children, leaf }) => {
    if(leaf.bold){
        children = <strong>{children}</strong>
    }
    if(leaf.italic){
        children = <em>{children}</em>
    }

    return (
        <span{...attributes}>
            {children}
        </span>
    )
}

const DefaultEement = props => {
    return <p {...props.attributes}>{props.children}</p>
}

export default App
