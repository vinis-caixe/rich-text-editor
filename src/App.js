import React, { useCallback, useMemo, useState } from 'react'
import { FaBold, FaItalic, FaCode, FaUnderline,
     FaAlignLeft, FaAlignCenter, FaAlignRight, FaAlignJustify,
     FaListUl, FaListOl } from 'react-icons/fa'
import { createEditor, Editor, Element, Transforms } from 'slate'
import { Slate, Editable, withReact } from 'slate-react'
import { withHistory } from 'slate-history' 
import Header from './components/Header'
import './App.css'

const LIST_TYPES = ['numbered-list', 'bulleted-list']
const TEXT_ALIGN_TYPES = ['left', 'right', 'center', 'justify']

const CustomEditor = {
    isMarkActive(editor, mark){
        const marks = Editor.marks(editor)
        return marks ? marks[mark] === true : false
    },

    isBlockActive(editor, block, blockType = 'type'){
        const { selection } = editor
        if(!selection) return false

        const [match] = Array.from(
            Editor.nodes(editor, {
                at: Editor.unhangRange(editor, selection),
                match: n => 
                    !Editor.isEditor(n) &&
                    Element.isElement(n) &&
                    n[blockType] === block,
            })
        )

        return !!match
    },

    toggleMark(editor, mark){
        const isActive = CustomEditor.isMarkActive(editor, mark)
        if(isActive){
            Editor.removeMark(editor, mark)
        }
        else{
            Editor.addMark(editor, mark, true)
        }
    },

    toggleBlock(editor, block){
        const isActive = CustomEditor.isBlockActive(
            editor,
            block,
            TEXT_ALIGN_TYPES.includes(block) ? 'align' : 'type'
        )
        const isList = LIST_TYPES.includes(block)

        Transforms.unwrapNodes(editor, {
            match: n =>
                !Editor.isEditor(n) &&
                Element.isElement(n) &&
                LIST_TYPES.includes(n.type) &&
                !TEXT_ALIGN_TYPES.includes(block),
            split: true,
        })
        let newProperties = Element
        if(TEXT_ALIGN_TYPES.includes(block)){
            newProperties = {
                align: isActive ? undefined : block,
            }
        }
        else{
            newProperties = {
                type: isActive ? 'paragraph' : isList ? 'list-item' : block,
            }
        }
        Transforms.setNodes(editor, newProperties)

        if(!isActive && isList){
            const format = { type: block, children: [] }
            Transforms.wrapNodes(editor, format)
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
        const style = { textAlign: props.element.align }
        switch (props.element.type){
            case 'bulleted-list':
                return (
                    <ul style={style} {...props.attributes}>
                        {props.children}
                    </ul>
                )
            case 'list-item':
                return (
                    <li style={style} {...props.attributes}>
                        {props.children}
                    </li>
                )
            case 'numbered-list':
                return (
                    <ol style={style} {...props.attributes}>
                        {props.children}
                    </ol>
                )
            default:
                return (
                    <p style={style} {...props.attributes}>
                        {props.children}
                    </p>
                )
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
            <div className='App'>
                <Header/>
                <div className='container'>
                    <div className='area-buttons'>
                        <button
                            onMouseDown={event => {
                                event.preventDefault()
                                CustomEditor.toggleMark(editor, 'bold')
                            }}
                        >
                            <FaBold/>
                        </button>
                        <button
                            onMouseDown={event => {
                                event.preventDefault()
                                CustomEditor.toggleMark(editor, 'italic')
                            }}
                        >
                            <FaItalic/>
                        </button>
                        <button
                            onMouseDown={event => {
                                event.preventDefault()
                                CustomEditor.toggleMark(editor, 'code')
                            }}
                        >
                            <FaCode/>
                        </button>
                        <button
                            onMouseDown={event => {
                                event.preventDefault()
                                CustomEditor.toggleMark(editor, 'underline')
                            }}
                        >
                            <FaUnderline/>
                        </button>
                        <button
                            onMouseDown={event => {
                                event.preventDefault()
                                CustomEditor.toggleBlock(editor, 'left')
                            }}
                        >
                            <FaAlignLeft/>
                        </button>
                        <button
                            onMouseDown={event => {
                                event.preventDefault()
                                CustomEditor.toggleBlock(editor, 'center')
                            }}
                        >
                            <FaAlignCenter/>
                        </button>
                        <button
                            onMouseDown={event => {
                                event.preventDefault()
                                CustomEditor.toggleBlock(editor, 'right')
                            }}
                        >
                            <FaAlignRight/>
                        </button>
                        <button
                            onMouseDown={event => {
                                event.preventDefault()
                                CustomEditor.toggleBlock(editor, 'justify')
                            }}
                        >
                            <FaAlignJustify/>
                        </button>
                        <button
                            onMouseDown={event => {
                                event.preventDefault()
                                CustomEditor.toggleBlock(editor, 'bulleted-list')
                            }}
                        >
                            <FaListUl/>
                        </button>
                        <button
                            onMouseDown={event => {
                                event.preventDefault()
                                CustomEditor.toggleBlock(editor, 'numbered-list')
                            }}
                        >
                            <FaListOl/>
                        </button>
                    </div>
                    <hr/>
                    <Editable 
                        editor={editor}
                        renderElement={renderElement}
                        renderLeaf={renderLeaf}
                        placeholder="Enter some rich text..."
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
                </div>
            </div>
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

export default App;
