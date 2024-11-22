import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  REDO_COMMAND,
  UNDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  FORMAT_TEXT_COMMAND,
  FORMAT_ELEMENT_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createParagraphNode,
  $getNodeByKey,
  LexicalEditor,
  BaseSelection
} from "lexical";
import { $isLinkNode, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $isParentElementRTL,
  $wrapNodes,
  $isAtNodeEnd
} from "@lexical/selection";
import { $getNearestNodeOfType, mergeRegister } from "@lexical/utils";
import {
  INSERT_ORDERED_LIST_COMMAND,
  INSERT_UNORDERED_LIST_COMMAND,
  REMOVE_LIST_COMMAND,
  $isListNode,
  ListNode
} from "@lexical/list";
import { createPortal } from "react-dom";
import {
  $createHeadingNode,
  $createQuoteNode,
  $isHeadingNode
} from "@lexical/rich-text";
import {
  $createCodeNode,
  $isCodeNode,
  getDefaultCodeLanguage,
  getCodeLanguages
} from "@lexical/code";

const LowPriority = 1;

const supportedBlockTypes = new Set([
  "paragraph",
  "quote",
  "code",
  "h1",
  "h2",
  "ul",
  "ol"
]);

const blockTypeToBlockName = {
  code: "Code Block",
  h1: "Large Heading",
  h2: "Small Heading",
  h3: "Heading",
  h4: "Heading",
  h5: "Heading",
  ol: "Numbered List",
  paragraph: "Normal",
  quote: "Quote",
  ul: "Bulleted List"
};

function Divider() {
  return <div className="w-px bg-border mx-1" />;
}

function positionEditorElement(editor: HTMLElement, rect: DOMRect | null) {
  if (rect === null) {
    editor.style.opacity = "0";
    editor.style.top = "-1000px";
    editor.style.left = "-1000px";
  } else {
    editor.style.opacity = "1";
    editor.style.top = `${rect.top + rect.height + window.pageYOffset + 10}px`;
    editor.style.left = `${
      rect.left + window.pageXOffset - editor.offsetWidth / 2 + rect.width / 2
    }px`;
  }
}

function FloatingLinkEditor({ editor }: {editor: LexicalEditor}) {
  const editorRef = useRef(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const mouseDownRef = useRef(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isEditMode, setEditMode] = useState(false);
  const [lastSelection, setLastSelection] = useState<BaseSelection | null>(null);

  const updateLinkEditor = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent)) {
        setLinkUrl(parent.getURL());
      } else if ($isLinkNode(node)) {
        setLinkUrl(node.getURL());
      } else {
        setLinkUrl("");
      }
    }
    const editorElem = editorRef.current;
    const nativeSelection = window.getSelection();
    const activeElement = document.activeElement;

    if (editorElem === null) {
      return;
    }

    const rootElement = editor.getRootElement();
    if (
      selection !== null &&
      !nativeSelection?.isCollapsed &&
      rootElement !== null &&
      rootElement.contains(nativeSelection?.anchorNode ?? null)
    ) {
      const domRange = nativeSelection?.getRangeAt(0);
      let rect;
      if (nativeSelection?.anchorNode === rootElement) {
        let inner = rootElement;
        while (inner.firstElementChild != null) {
          inner = inner.firstElementChild as HTMLElement;
        }
        rect = inner.getBoundingClientRect();
      } else {
        rect = domRange?.getBoundingClientRect() ?? null;
      }

      if (!mouseDownRef.current) {
        positionEditorElement(editorElem, rect);
      }
      setLastSelection(selection);
    } else if (!activeElement || activeElement.className !== "block w-[calc(100%-24px)] box-border m-2 px-3 py-2 rounded-[15px] bg-gray-200 text-[15px] text-gray-900 border-0 outline-none font-inherit") {
      positionEditorElement(editorElem, null);
      setLastSelection(null);
      setEditMode(false);
      setLinkUrl("");
    }

    return true;
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateLinkEditor();
        });
      }),

      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateLinkEditor();
          return true;
        },
        LowPriority
      )
    );
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    editor.getEditorState().read(() => {
      updateLinkEditor();
    });
  }, [editor, updateLinkEditor]);

  useEffect(() => {
    if (isEditMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditMode]);

  return (
    <div ref={editorRef} className="absolute z-100 top-[-10000px] left-[-10000px] mt-[-6px] max-w-80 w-full opacity-0 bg-background-secondary border-x-boxShadow-sm rounded-lg">
      {isEditMode ? (
        <input
          ref={inputRef}
          className="block w-[calc(100%-24px)] box-border m-2 px-3 py-2 rounded-[15px] bg-gray-200 text-[15px] text-gray-900 border-0 outline-none font-inherit"
          value={linkUrl}
          onChange={(event) => {
            setLinkUrl(event.target.value);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              if (lastSelection !== null) {
                if (linkUrl !== "") {
                  editor.dispatchCommand(TOGGLE_LINK_COMMAND, linkUrl);
                }
                setEditMode(false);
              }
            } else if (event.key === "Escape") {
              event.preventDefault();
              setEditMode(false);
            }
          }}
        />
      ) : (
        <>
          <div className="block w-[calc(100%-24px)] box-border m-2 px-3 py-2 rounded-[15px] bg-gray-200 text-[15px] text-gray-900 border-0 outline-none font-inherit">
            <a href={linkUrl} target="_blank" rel="noopener noreferrer">
              {linkUrl}
            </a>
            <div
              className="link-edit"
              role="button"
              tabIndex={0}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                setEditMode(true);
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}

function Select({ onChange, className, options, value }: { onChange: (event: React.ChangeEvent<HTMLSelectElement>) => void, className: string, options: string[], value: string }) {
  return (
    <select className={className} onChange={onChange} value={value}>
      <option hidden={true} value="" />
      {options.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function getSelectedNode(selection: any) {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? focusNode : anchorNode;
  }
}

// change blockType to a type having all used html elements

function BlockOptionsDropdownList({
  editor,
  blockType,
  toolbarRef,
  setShowBlockOptionsDropDown
}: {editor: LexicalEditor, blockType: string, toolbarRef: React.RefObject<HTMLDivElement>, setShowBlockOptionsDropDown: (show: boolean) => void}) {
  const dropDownRef = useRef(null);

  useEffect(() => {
    const toolbar = toolbarRef.current;
    const dropDown = dropDownRef.current as unknown as HTMLElement;

    if (toolbar !== null && dropDown !== null) {
      const { top, left } = toolbar.getBoundingClientRect();
      dropDown.style.top = `${top + 40}px`;
      dropDown.style.left = `${left}px`;
    }
  }, [dropDownRef, toolbarRef]);

  useEffect(() => {
    const dropDown = dropDownRef.current as unknown as HTMLElement;
    const toolbar = toolbarRef.current as HTMLElement;

    if (dropDown !== null && toolbar !== null) {
      const handle = (event: MouseEvent) => {
        const target = event.target as HTMLElement;

        if (!dropDown.contains(target) && !toolbar.contains(target)) {
          setShowBlockOptionsDropDown(false);
        }
      };
      document.addEventListener("click", handle);

      return () => {
        document.removeEventListener("click", handle);
      };
    }
  }, [dropDownRef, setShowBlockOptionsDropDown, toolbarRef]);

  const formatParagraph = () => {
    if (blockType !== "paragraph") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createParagraphNode());
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatLargeHeading = () => {
    if (blockType !== "h1") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode("h1"));
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatSmallHeading = () => {
    if (blockType !== "h2") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createHeadingNode("h2"));
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatBulletList = () => {
    if (blockType !== "ul") {
      editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatNumberedList = () => {
    if (blockType !== "ol") {
      editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
      editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined);
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatQuote = () => {
    if (blockType !== "quote") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createQuoteNode());
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  const formatCode = () => {
    if (blockType !== "code") {
      editor.update(() => {
        const selection = $getSelection();

        if ($isRangeSelection(selection)) {
          $wrapNodes(selection, () => $createCodeNode());
        }
      });
    }
    setShowBlockOptionsDropDown(false);
  };

  return (
    <div className="z-5 block absolute shadow-dropdown rounded-lg min-w-[100px] min-h-[40px] bg-background-secondary" ref={dropDownRef}>
      <button className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]" onClick={formatParagraph}>
        <i className="icon-paragraph"></i>
        <span className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]">Normal</span>
        {blockType === "paragraph" && <span className="bg-background-highlight" />}
      </button>
      <button className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]" onClick={formatLargeHeading}>
        <i className="icon-type-h1"></i>
        <span className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]">Large Heading</span>
        {blockType === "h1" && <span className="bg-background-highlight" />}
      </button>
      <button className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]" onClick={formatSmallHeading}>
        <i className="icon-type-h2"></i>
        <span className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]">Small Heading</span>
        {blockType === "h2" && <span className="bg-background-highlight" />}
      </button>
      <button className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]" onClick={formatBulletList}>
        <i className="icon-list-ul"></i>
        <span className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]">Bullet List</span>
        {blockType === "ul" && <span className="bg-background-highlight" />}
      </button>
      <button className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]" onClick={formatNumberedList}>
        <i className="icon-list-ol"></i>
        <span className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]">Numbered List</span>
        {blockType === "ol" && <span className="bg-background-highlight" />}
      </button>
      <button className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]" onClick={formatQuote}>
        <i className="icon-quote"></i>
        <span className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]">Quote</span>
        {blockType === "quote" && <span className="bg-background-highlight" />}
      </button>
      <button className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]" onClick={formatCode}>
        <i className="icon-code"></i>
        <span className="item mx-2 my-0 px-2 py-1 text-text-secondary cursor-pointer leading-4 text-[15px] flex items-center flex-row flex-shrink-0 justify-between bg-background-secondary rounded-lg border-0 min-w-[268px]">Code Block</span>
        {blockType === "code" && <span className="bg-background-highlight" />}
      </button>
    </div>
  );
}

export default function ToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>("paragraph");
  const [selectedElementKey, setSelectedElementKey] = useState<string | null>(null);
  const [showBlockOptionsDropDown, setShowBlockOptionsDropDown] = useState(
    false
  );
  const [codeLanguage, setCodeLanguage] = useState("");
  const [isRTL, setIsRTL] = useState(false);
  const [isLink, setIsLink] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [isCode, setIsCode] = useState(false);

  const updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      const anchorNode = selection.anchor.getNode();
      const element =
        anchorNode.getKey() === "root"
          ? anchorNode
          : anchorNode.getTopLevelElementOrThrow();
      const elementKey = element.getKey();
      const elementDOM = editor.getElementByKey(elementKey);
      if (elementDOM !== null) {
        setSelectedElementKey(elementKey);
        if ($isListNode(element)) {
          const parentList = $getNearestNodeOfType(anchorNode, ListNode);
          const type = parentList ? parentList.getTag() : element.getTag();
          setBlockType(type as keyof typeof blockTypeToBlockName);
        } else {
          const type = $isHeadingNode(element)
            ? element.getTag()
            : element.getType();
          setBlockType(type as keyof typeof blockTypeToBlockName);
          if ($isCodeNode(element)) {
            setCodeLanguage(element.getLanguage() || getDefaultCodeLanguage());
          }
        }
      }
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));
      setIsCode(selection.hasFormat("code"));
      setIsRTL($isParentElementRTL(selection));

      // Update links
      const node = getSelectedNode(selection);
      const parent = node.getParent();
      if ($isLinkNode(parent) || $isLinkNode(node)) {
        setIsLink(true);
      } else {
        setIsLink(false);
      }
    }
  }, [editor]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, newEditor) => {
          updateToolbar();
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority
      )
    );
  }, [editor, updateToolbar]);

  const codeLanguges = useMemo(() => getCodeLanguages(), []);
  const onCodeLanguageSelect = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      editor.update(() => {
        if (selectedElementKey !== null) {
          const node = $getNodeByKey(selectedElementKey);
          if ($isCodeNode(node)) {
            node.setLanguage(e.target.value);
          }
        }
      });
    },
    [editor, selectedElementKey]
  );

  const insertLink = useCallback(() => {
    if (!isLink) {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, "https://");
    } else {
      editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    }
  }, [editor, isLink]);

  return (
    <div className="flex flex-row mb-1 min-w-[43rem] bg-background-secondary p-1 rounded-tl-lg rounded-tr-lg align-middle justify-center" ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="border-none flex text-text-secondary bg-background-secondary p-1 m-1 rounded-md cursor-pointer align-middle mr-0.5"
        aria-label="Undo"
      >
        <i className="icon-arrow-counterclockwise" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="border-none flex text-text-secondary bg-background-secondary p-1 m-1 rounded-md cursor-pointer align-middle"
        aria-label="Redo"
      >
        <i className="icon-arrow-clockwise" />
      </button>
      <Divider />
      {supportedBlockTypes.has(blockType) && (
        <>
          <button
            className="border-none flex text-text-secondary bg-background-secondary p-1 m-1 rounded-md cursor-pointer align-middle"
            onClick={() =>
              setShowBlockOptionsDropDown(!showBlockOptionsDropDown)
            }
            aria-label="Formatting Options"
          >
            <span className={"icon-" + blockType} />
            <span className="flex leading-5 w-32 align-middle text-sm text-text-secondary text-ellipsis overflow-hidden h-5 text-left">{blockTypeToBlockName[blockType]}</span>
            <i className="icon-chevron-down" />
          </button>
          {showBlockOptionsDropDown &&
            createPortal(
              <BlockOptionsDropdownList
                editor={editor}
                blockType={blockType}
                toolbarRef={toolbarRef}
                setShowBlockOptionsDropDown={setShowBlockOptionsDropDown}
              />,
              document.body
            )}
          <Divider />
        </>
      )}
      {blockType === "code" ? (
        <>
          <Select
            className="border-none flex bg-background-secondary rounded-xl p-1 align-middle text-sm text-text-secondary text-ellipsis capitalize w-32"
            onChange={onCodeLanguageSelect}
            options={codeLanguges}
            value={codeLanguage}
          />
          <i className="icon-chevron-down" />
        </>
      ) : (
        <>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
            }}
            className={"border-none flex text-text-secondary bg-background-secondary p-1 m-1 rounded-md cursor-pointer align-middle " + (isBold ? "!bg-background-highlight" : "")}
            aria-label="Format Bold"
          >
            <i className="icon-type-bold" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
            }}
            className={"border-none flex text-text-secondary bg-background-secondary p-1 m-1 rounded-md cursor-pointer align-middle " + (isItalic ? "!bg-background-highlight" : "")}
            aria-label="Format Italics"
          >
            <i className="icon-type-italic" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
            }}
            className={"border-none flex text-text-secondary bg-background-secondary p-1 m-1 rounded-md cursor-pointer align-middle " + (isUnderline ? "!bg-background-highlight" : "")}
            aria-label="Format Underline"
          >
            <i className="icon-type-underline" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
            }}
            className={
              "border-none flex text-text-secondary bg-background-secondary p-1 m-1 rounded-md cursor-pointer align-middle " + (isStrikethrough ? "!bg-background-highlight" : "")
            }
            aria-label="Format Strikethrough"
          >
            <i className="icon-type-strikethrough" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_TEXT_COMMAND, "code");
            }}
            className={"border-none flex text-text-secondary bg-background-secondary p-1 m-1 rounded-md cursor-pointer align-middle " + (isCode ? "!bg-background-highlight" : "")}
            aria-label="Insert Code"
          >
            <i className="icon-code" />
          </button>
          <button
            onClick={insertLink}
            className={"border-none flex text-text-secondary bg-background-secondary p-1 m-1 rounded-md cursor-pointer align-middle " + (isLink ? "!bg-background-highlight" : "")}
            aria-label="Insert Link"
          >
            <i className="icon-link" />
          </button>
          {isLink &&
            createPortal(<FloatingLinkEditor editor={editor} />, document.body)}
          <Divider />
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
            }}
            className="border-none flex text-text-secondary bg-background-secondary p-1 m-1 rounded-md cursor-pointer align-middle "
            aria-label="Left Align"
          >
            <i className="icon-text-left" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
            }}
            className="border-none flex text-text-secondary bg-background-secondary p-1 m-1 rounded-md cursor-pointer align-middle "
            aria-label="Center Align"
          >
            <i className="icon-text-center" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
            }}
            className="border-none flex text-text-secondary bg-background-secondary p-1 m-1 rounded-md cursor-pointer align-middle "
            aria-label="Right Align"
          >
            <i className="icon-text-right" />
          </button>
          <button
            onClick={() => {
              editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "justify");
            }}
            className="border-none flex text-text-secondary bg-background-secondary p-1 m-1 rounded-md cursor-pointer align-middle "
            aria-label="Justify Align"
          >
            <i className="icon-text-paragraph" />
          </button>{" "}
        </>
      )}
    </div>
  );
}
