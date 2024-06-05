export const types = {
  data: [
    {
      labels: [
        {
          paragraph: "text",
        },
        {
          image: "image",
        },
        {
          terminology: "text",
        },
        {
          terminologyDefinition: "text",
        },
        {
          terminologyAbbreviation: "text",
        },
        {
          MCQ: "MCQ",
        },
        {
          ImageSlider: "ImageSlider",
        },
        {
          ImageHotspot: "ImageHotspot",
        },
        {
          MarkWords: "MarkWords",
        },
        {
          FlashCards: "FlashCards",
        },
        {
          Dictation: "Dictation",
        },
        {
          Essay: "Essay",
        },
        {
          GuessAnswer: "GuessAnswer",
        },
        {
          DragTheWords: "DragTheWords",
        },
        {
          SortTheParagraphs: "SortTheParagraphs",
        },
        {
          "image-choice": "image-choice",
        },
        {
          ImageJuxtaPosition: "ImageJuxtaPosition",
        },
        {
          MarkTheWord: "MarkTheWord",
        },
        {
          DragWords: "DragWords",
        },
        {
          ImageBlinder: "ImageBlinder",
        },
        {
          DialogCard: "DialogCard",
        },
        {
          ImageChoice: "ImageChoice",
        },
        {
          Accordion: "Accordion",
        },
        {
          Charts: "Charts",
        },
        {
          FillTheBlank: "FillTheBlank",
        },
        {
          Graph: "Graph",
        },
        {
          Equation: "Equation",
        },
        {
          Slider: "Slider",
        },
      ],
      _id: "65dc53b60ec4b718aeb31db6",
      typeName: "SI",
    },
    {
      labels: [
        {
          GuessTheImage: "GuessAnswer",
        },
        {
          WhatHappensWhen: "GuessAnswer",
        },
        {
          HowItMightHappen: "GuessAnswer",
        },
      ],
      _id: "65dc53b60ec4b718aeb31db6",
      typeName: "Question",
    },
    {
      labels: [
        {
          Objective: "text",
        },
        {
          Paragraph: "image",
        },
        {
          Picture: "text",
        },
        {
          Voice: "text",
        },
        {
          Video: "text",
        },
      ],
      _id: "65dc53b60ec4b718aeb31db6",
      typeName: "SimpleItem",
    },
    {
      labels: [
        {
          BarChar: "Chart",
        },
        {
          PieChart: "Chart",
        },
        {
          NumbericTable: "Chart",
        },
        {
          Analytics: "Chart",
        },
        {
          Classification: "ImageSlider",
        },
        {
          DifferentCases: "ImageSlider",
        },
      ],
      _id: "65dc53b60ec4b718aeb31db6",
      typeName: "InteractiveObject",
    },
    {
      labels: [
        {
          _Question_: "text",
        },
        {
          _Picture_: "image",
        },
        {
          _AlternativeText_: "text",
        },
        {
          _HoverText_: "text",
        },
        {
          correct: "Boolean",
        },
      ],
      _id: "664ca36c35ea510043e893a2",
      typeName: "Test",
      abstractParameter: {
        _Question_: "text",
        correct: "Boolean",
      },
    },
    {
      labels: [
        {
          _Path_: "video",
        },
        {
          _InteractionFrom_: "number",
        },
        {
          _InteractionTo_: "number",
        },
        {
          _InteractionLabel_: "text",
        },
        {
          _InteractionText_: "text",
        },
        {
          _InteractionPause_: "boolean",
        },
        {
          _BookmarkTime_: "number",
        },
        {
          _BookmarkLabel_: "text",
        },
        {
          _EndscreenTime_: "number",
        },
        {
          _EndscreenLabel_: "text",
        },
        {
          _SummaryIntro_: "text",
        },
        {
          _SummaryTip_: "text",
        },
        {
          _SummaryText_: "text",
        },
      ],
      _id: "66135fa69767980044ae5ed6",
      typeName: "InteractiveVideo",
      abstractParameter: {
        _Path_: "video",
        interactions: [
          {
            _InteractionFrom_: "text",
            _InteractionTo_: "text",
            _InteractionLabel_: "text",
            _InteractionText_: "text",
            _Pause_: "boolean",
          },
        ],
        bookmarks: [
          {
            _BookmarkTime_: "text",
            _BookmarkLabel_: "text",
          },
        ],
        endscreens: [
          {
            _EndscreenTime_: "text",
            _EndscreenLabel_: "text",
          },
        ],
        summary: {
          _SummaryIntro_: "text",
          summaries: [
            {
              _SummaryTip_: "text",
              _SummaryText_: "text",
            },
          ],
        },
      },
    },
    {
      labels: [
        {
          _Heading_: "text",
        },
        {
          _Path_: "image",
        },
        {
          _Alt_: "text",
        },
        {
          _HoverText_: "text",
        },
        {
          _Label_: "text",
        },
        {
          _Description_: "text",
        },
      ],
      _id: "66131b7beb5fe40044f22a6a",
      typeName: "Agamotto",
      abstractParameter: {
        _Heading_: "text",
        items: [
          {
            _Path_: "image",
            _Alt_: "text",
            _HoverText_: "text",
            _Label_: "text",
            _Description_: "text",
          },
        ],
      },
    },
    {
      labels: [
        {
          taskDescription: "text",
        },
        {
          path: "image",
        },
        {
          Path: "image",
        },
        {
          imageAlt: "text",
        },
        {
          matchAlt: "text",
        },
      ],
      _id: "65dde80173a37a0033a7c3b0",
      typeName: "ImagePairing",
    },
    {
      labels: [
        {
          _TaskDescription_: "text",
        },
        {
          _TextField_: "text",
        },
      ],
      _id: "65d70facc44c6400345868ff",
      typeName: "MarkWords",
    },
    {
      labels: [
        {
          title: "text",
        },
        {
          path: "image",
        },
        {
          " alt": "text",
        },
        {
          " titleHover": "text",
        },
        {
          labelText: "text",
        },
        {
          description: "text",
        },
      ],
      _id: "65d70d33d801844b44f4b884",
      typeName: "ImageBlender",
    },
    {
      labels: [
        {
          title: "text",
        },
        {
          discription: "text",
        },
        {
          text: "text",
        },
        {
          answer: "text",
        },
        {
          tipFront: "text",
        },
        {
          tipBack: "text",
        },
        {
          image: "card",
        },
        {
          audio: "voice",
        },
      ],
      _id: "65d67be6514f0600340fd473",
      typeName: "DialogCard",
    },
    {
      labels: [
        {
          _Question_: "text",
        },
        {
          _Picture_: "image",
        },
        {
          _AlternativeText_: "text",
        },
        {
          _HoverText_: "text",
        },
        {
          correct: "Boolean",
        },
      ],
      _id: "65d60242362fb500344f3152",
      typeName: "ImageChoice",
      abstractParameter: {
        _Question_: "text",
        options: [
          {
            _Picture_: "image",
            _AlternativeText_: "text",
            _HoverText_: "text",
            correct: "Boolean",
          },
        ],
      },
    },
    {
      labels: [
        {
          image: "image",
        },
        {
          color: "string",
        },
        {
          header: "text",
        },
        {
          positionX: "number",
        },
        {
          positionY: "number",
        },
        {
          explanationText: "text",
        },
      ],
      _id: "65d5ef12ab878400342a5b68",
      typeName: "image hotspot",
    },
    {
      labels: [
        {
          image: "image",
        },
        {
          color: "string",
        },
        {
          header: "text",
        },
        {
          positionX: "number",
        },
        {
          positionY: "number",
        },
        {
          explanationText: "text",
        },
      ],
      _id: "65d5cf8357f2d00034ed77a2",
      typeName: "imageHotspot",
    },
    {
      labels: [
        {
          _TaskDescription_: "text",
        },
        {
          _Picture_: "image",
        },
        {
          _Question_: "text",
        },
        {
          _Answer_: "text",
        },
        {
          _Tip_: "text",
        },
        {
          _AltText_: "text",
        },
      ],
      _id: "65d4c855f110d000342ad3d1",
      typeName: "FlashCards",
      abstractParameter: {
        _TaskDescription_: "text",
        cards: [
          {
            _Picture_: "image",
          },
          {
            _Question_: "text",
          },
          {
            _Answer_: "text",
          },
          {
            _Tip_: "text",
          },
          {
            _AltText_: "text",
          },
        ],
      },
    },
    {
      labels: [
        {
          image: "image",
        },
        {
          alt: "text",
        },
        {
          title: "text",
        },
      ],
      _id: "65d4bc1b1a287900346dd8d8",
      typeName: "ImageSlider",
    },
    {
      labels: [
        {
          image: "image",
        },
        {
          color: "string",
        },
        {
          header: "text",
        },
        {
          positionX: "number",
        },
        {
          positionY: "number",
        },
        {
          explanationText: "text",
        },
      ],
      _id: "65d31f6d86098b00344dae3b",
      typeName: "ImageHotspot",
    },
    {
      labels: [
        {
          _Text_: "text",
        },
        {
          _Path_: "text",
        },
      ],
      _id: "65cf6a08d416db0034f58955",
      typeName: "Dictation",
    },
    {
      labels: [
        {
          _Question_: "text",
        },
        {
          _Answer_: "text",
        },
      ],
      _id: "65cf46a90e54db003363bddd",
      typeName: "Essay",
      abstractParameter: {
        _Question_: "text",
        _Answer_: "text",
      },
    },
    {
      labels: [
        {
          _taskDescription_: "text",
        },
        {
          _solutionText_: "text",
        },
        {
          _image_: "image",
        },
        {
          _alt_: "text",
        },
      ],
      _id: "65cf0250f359c9003466e41d",
      typeName: "GuessAnswer",
      abstractParameter: {
        _taskDescription_: "text",
        " _solutionText_": "text",
        _image_: "image",
        _alt_: "text",
      },
    },
    {
      labels: [
        {
          _sentence_: "text",
        },
        {
          _answer_: "text",
        },
        {
          _tip_: "text",
        },
      ],
      _id: "65ce8bdabd707400346cca80",
      typeName: "DragTheWords",
      abstractParameter: {
        textField: [
          {
            _sentence_: "text",
            "-answer_": "text",
            _tip_: "text",
          },
        ],
      },
    },
    {
      labels: [
        {
          taskDescription: "text",
        },
        {
          paragraph: "text",
        },
      ],
      _id: "65ce77271fcb2d003407283d",
      typeName: "SortTheParagraphs",
    },
    {
      labels: [
        {
          _ImageBefore_: "image",
        },
        {
          _altBefore_: "text",
        },
        {
          _ImageAfter_: "image",
        },
        {
          _altAfter_: "text",
        },
      ],
      _id: "65ce5a2f3ca84700343eea03",
      typeName: "ImageJuxtaPosition",
      abstractParameter: {
        _ImageBefore_: "image",
        _altBefore_: "text",
        _ImageAfter_: "image",
        _altAfter_: "text",
      },
    },
    {
      labels: [
        {
          taskDescription: "text",
        },
        {
          textField: "text",
        },
        {
          correctAnswer: "text",
        },
      ],
      _id: "65ce55523ec8eb0034d00b29",
      typeName: "MarkTheWord",
    },
    {
      labels: [
        {
          sentence: "text",
        },
        {
          answer: "image",
        },
        {
          tip: "text",
        },
        {
          hintT: "text",
        },
        {
          hintF: "text",
        },
      ],
      _id: "65ce52143ec8eb0034d00b1e",
      typeName: "DragWords",
    },
    {
      labels: [
        {
          _Title_: "text",
        },
        {
          _Text_: "text",
        },
      ],
      _id: "65ce1352b4a64c0035f1e8f6",
      typeName: "Accordion",
    },
    {
      labels: [
        {
          image: "image",
        },
        {
          alt: "text",
        },
        {
          title: "text",
        },
        {
          " description": "text",
        },
      ],
      _id: "65ce0c5efc57a80034545530",
      typeName: "imageBlinder",
    },
    {
      labels: [
        {
          _GraphMode_: "text",
        },
        {
          _Text_: "text",
        },
        {
          _Value_: "text",
        },
        {
          _Color_: "text",
        },
        {
          _FontColor_: "text",
        },
      ],
      _id: "65cdff88ff619a00344e8b73",
      typeName: "Charts",
      abstractParameter: {
        _GraphMode_: "text",
        option: [
          {
            _Text_: "text",
            _Value_: "text",
            _Color_: "text",
            _FontColor_: "text",
          },
        ],
      },
    },
    {
      labels: [
        {
          title: "text",
        },
        {
          path: "image",
        },
        {
          " alt": "text",
        },
        {
          " title": "text",
        },
        {
          labelText: "text",
        },
        {
          description: "text",
        },
      ],
      _id: "65cd5259ab76d4003398fb1a",
      typeName: "ImageBlinder",
    },
    {
      labels: [
        {
          _Question_: "text",
        },
        {
          _Answer_: "text",
        },
        {
          _Tip_: "text",
        },
      ],
      _id: "65ccf38d2bc7f5003417ccec",
      typeName: "FillTheBlank",
      abstractParameter: {
        _Question_: "text",
        answers: [
          {
            _Answer_: "text",
            _Tip_: "text",
          },
        ],
      },
    },
    {
      labels: [
        {
          _question_: "text",
        },
        {
          _option_: "text",
        },
        {
          _chosenFeedback_: "text",
        },
        {
          _notChosenFeedback_: "text",
        },
        {
          _tip_: "text",
        },
        {
          correct: "text",
        },
      ],
      _id: "65cbac926e0b5c893e0990ac",
      typeName: "MCQ",
      abstractParameter: {
        _question_: "text",
        answers: [
          {
            _option_: "text",
            _tip_: "text",
            _chosenFeedback_: "text",
            _notChosenFeedback_: "text",
            correct: "text",
          },
        ],
      },
    },
  ],
};
