import React, { useCallback, useMemo, useState } from 'react'
import { createEditor, Editor } from 'slate'
import { Slate, Editable, withReact} from 'slate-react'

const CustomEditor = {
    isBoldMarkActive(editor){
        const marks = Editor.marks(editor)
        return marks ? marks.bold === true : false
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
}

const App = () => {
    const [editor] = useState(() => withReact(createEditor()))

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

                            default:
                                
                        }

                    }}
                />
        </Slate>
    )
}

const Leaf = props => {
    return (
        <span
            {...props.attributes}
            style={{ fontWeight: props.leaf.bold ? 'bold' : 'normal' }}
        >
            {props.children}
        </span>
    )
}

const DefaultEement = props => {
    return <p {...props.attributes}>{props.children}</p>
}

export default App
