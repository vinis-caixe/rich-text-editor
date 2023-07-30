import React, { useCallback, useMemo, useState } from 'react'
import { createEditor, Editor } from 'slate'
import { Slate, Editable, withReact} from 'slate-react'
import { withHistory } from 'slate-history' 

const CustomEditor = {
    isMarkActive(editor, mark){
        const marks = Editor.marks(editor)
        switch(mark){
            case 'bold': {
                return marks ? marks.bold === true : false
            }
            case 'italic': {
                return marks ? marks.italic === true : false
            }
            case 'code': {
                return marks ? marks.code === true : false
            }   
            case 'underline': {
                return marks ? marks.underline === true : false
            }
            default: {
                return false
            }
        }
    },

    toggleMark(editor, mark){
        const isActive = CustomEditor.isMarkActive(editor, mark)
        if(isActive){
            Editor.removeMark(editor, mark)
        }
        else{
            Editor.addMark(editor, mark, true)
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
            spellCheck={false}
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
                            CustomEditor.toggleMark(editor, 'bold')
                        }}
                    >
                        Bold
                    </button>
                    <button
                        onMouseDown={event => {
                            event.preventDefault()
                            CustomEditor.toggleMark(editor, 'italic')
                        }}
                    >
                        Italic
                    </button>
                    <button
                        onMouseDown={event => {
                            event.preventDefault()
                            CustomEditor.toggleMark(editor, 'code')
                        }}
                    >
                        Code
                    </button>
                    <button
                        onMouseDown={event => {
                            event.preventDefault()
                            CustomEditor.toggleMark(editor, 'underline')
                        }}
                    >
                        Underline
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
                                CustomEditor.toggleMark(editor, 'bold')
                                break
                            }
                            case 'i': {
                                event.preventDefault()
                                CustomEditor.toggleMark(editor, 'italic')
                                break
                            }
                            case '`': {
                                event.preventDefault()
                                CustomEditor.toggleMark(editor, 'code')
                                break
                            }
                            case 'u': {
                                event.preventDefault()
                                CustomEditor.toggleMark(editor, 'underline')
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
    if(leaf.code){
        children = <code>{children}</code>
    }
    if(leaf.underline){
        children = <u>{children}</u>
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
