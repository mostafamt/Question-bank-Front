export const data = {
  questionName: "Test",
  objectOwner: "me",
  domainId: "2711ca97c3a47af8c82925e8cd233d0e",
  subDomainId: "d7c8da80d67227affcb50494c1a9cfa7",
  topic: " topic  ",
  language: "en",
  type: "SI",
  domainName: "Science",
  subDomainName: "Chemistry",
  labels: [
    {
      "*_Question_": "text",
    },
    {
      "*_OptionText_": "text",
    },
    {
      _ChosenFeedback_: "text",
    },
    {
      _notChosenFeedback_: "text",
    },
    {
      _Tip_: "text",
    },
    {
      "#_Correct_": "Bool",
    },
  ],
  types: [
    {
      labels: [
        {
          "*_Question_": "text",
        },
        {
          "*_OptionText_": "text",
        },
        {
          _ChosenFeedback_: "text",
        },
        {
          _notChosenFeedback_: "text",
        },
        {
          _Tip_: "text",
        },
        {
          "#_Correct_": "Bool",
        },
      ],
      hints: [],
      _id: "6662f6e41f62310044bd897d",
      typeName: "Text MCQ",
      category: "Q",
      repeatedString:
        '{"correct":_Correct_,"tipsAndFeedback":{"tip":"<p>_Tip_</p>\\n","chosenFeedback":"<div>_ChosenFeedback_</div>\\n","notChosenFeedback":"<div>_notChosenFeedbacck_</div>\\n"},"text":"<div>_OptionText_</div>\\n"}',
      repeated2: "",
      repeated3: "",
      htmlSeparator: ",",
      abstractParameter: {
        _Question_: "text",
        "Answers  2": [
          {
            _OptionText_: "text",
            _Correct_: "Bool",
            _ChosenFeedback_: "text",
            _notChosenFeedback_: "text",
            _Tip_: "text",
          },
        ],
      },
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBUZXh0IE1DUSBUZW1wbGF0ZSIsImlkIjoiNjY1MjM5ZTljOGFlMGRmYmJlNDI4YjQ0In0=",
      templateName: "my New Text MCQ Template",
      originalJson:
        '{"media":{"disableImageZooming":false},"answers":[{"correct":false,"tipsAndFeedback":{"tip":"<p>_Tip_</p>\\n","chosenFeedback":"<div>_ChosenFeedback_</div>\\n","notChosenFeedback":"<div>_notChosenFeedbacck_</div>\\n"},"text":"<div>_OptionText_</div>\\n"}],"overallFeedback":[{"from":0,"to":59,"feedback":"You need to study harder"},{"from":60,"to":79,"feedback":"Good, but you can do better"},{"from":80,"to":89,"feedback":"Very Good"},{"from":90,"to":100,"feedback":"Excellent"}],"behaviour":{"enableRetry":true,"enableSolutionsButton":true,"enableCheckButton":true,"type":"auto","singlePoint":false,"randomAnswers":true,"showSolutionsRequiresInput":true,"confirmCheckDialog":false,"confirmRetryDialog":false,"autoCheck":false,"passPercentage":100,"showScorePoints":true},"UI":{"checkAnswerButton":"Check","submitAnswerButton":"Submit","showSolutionButton":"Show solution","tryAgainButton":"Retry","tipsLabel":"Show tip","scoreBarLabel":"You got :num out of :total points","tipAvailable":"Tip available","feedbackAvailable":"Feedback available","readFeedback":"Read feedback","wrongAnswer":"Wrong answer","correctAnswer":"Correct answer","shouldCheck":"Should have been checked","shouldNotCheck":"Should not have been checked","noInput":"Please answer before viewing the solution","a11yCheck":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","a11yShowSolution":"Show the solution. The task will be marked with its correct solution.","a11yRetry":"Retry the task. Reset all responses and start the task over again."},"confirmCheck":{"header":"Finish ?","body":"Are you sure you wish to finish ?","cancelLabel":"Cancel","confirmLabel":"Finish"},"confirmRetry":{"header":"Retry ?","body":"Are you sure you wish to retry ?","cancelLabel":"Cancel","confirmLabel":"Confirm"},"question":"<p>_Question_</p>\\n"}',
      modifiedJson:
        '{"media":{"disableImageZooming":false},"answers":[{"correct":_Correct_,"tipsAndFeedback":{"tip":"<p>_Tip_</p>\\n","chosenFeedback":"<div>_ChosenFeedback_</div>\\n","notChosenFeedback":"<div>_notChosenFeedbacck_</div>\\n"},"text":"<div>_OptionText_</div>\\n"}],"overallFeedback":[{"from":0,"to":59,"feedback":"You need to study harder"},{"from":60,"to":79,"feedback":"Good, but you can do better"},{"from":80,"to":89,"feedback":"Very Good"},{"from":90,"to":100,"feedback":"Excellent"}],"behaviour":{"enableRetry":true,"enableSolutionsButton":true,"enableCheckButton":true,"type":"auto","singlePoint":false,"randomAnswers":true,"showSolutionsRequiresInput":true,"confirmCheckDialog":false,"confirmRetryDialog":false,"autoCheck":false,"passPercentage":100,"showScorePoints":true},"UI":{"checkAnswerButton":"Check","submitAnswerButton":"Submit","showSolutionButton":"Show solution","tryAgainButton":"Retry","tipsLabel":"Show tip","scoreBarLabel":"You got :num out of :total points","tipAvailable":"Tip available","feedbackAvailable":"Feedback available","readFeedback":"Read feedback","wrongAnswer":"Wrong answer","correctAnswer":"Correct answer","shouldCheck":"Should have been checked","shouldNotCheck":"Should not have been checked","noInput":"Please answer before viewing the solution","a11yCheck":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","a11yShowSolution":"Show the solution. The task will be marked with its correct solution.","a11yRetry":"Retry the task. Reset all responses and start the task over again."},"confirmCheck":{"header":"Finish ?","body":"Are you sure you wish to finish ?","cancelLabel":"Cancel","confirmLabel":"Finish"},"confirmRetry":{"header":"Retry ?","body":"Are you sure you wish to retry ?","cancelLabel":"Cancel","confirmLabel":"Confirm"},"question":"<p>_Question_</p>\\n"}',
      exampleId: "",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Text_MCQ_Template_665239e8c6395f4cf2670e2d.html",
    },
    {
      labels: [
        {
          "*_TaskDescription_": "text",
        },
        {
          "*_Sentence_": "text",
        },
        {
          _Answer_: "text",
        },
        {
          _RestSentence_: "text",
        },
      ],
      hints: [],
      _id: "66630278aa50ee0044ea3ba0",
      typeName: "Mark The Words",
      category: "Q",
      repeatedString: "_Sentence_ *_Answer_* _RestSentence_",
      repeated2: "",
      repeated3: "",
      htmlSeparator: "",
      abstractParameter: {
        _TaskDescription_: "text",
        Sentences: [
          {
            _Sentence_: "text",
            _Answer_: "text",
            _RestSentence_: "text",
          },
        ],
      },
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBNYXJrIHRoZSBXb3JkIFRlbXBsYXRlIiwiaWQiOiI2NjU3ODFlN2VhM2FhNzEzNDdiZWNlMzIifQ==",
      templateName: "my New Mark the Word Template",
      originalJson:
        '{"media":{"disableImageZooming":false},"overallFeedback":[{"from":0,"to":59,"feedback":"You need to work harder"},{"from":60,"to":79,"feedback":"Good, but you can do better"},{"from":80,"to":89,"feedback":"Very good"},{"from":90,"to":100,"feedback":"Excellent"}],"checkAnswerButton":"Check","submitAnswerButton":"Submit","tryAgainButton":"Retry","showSolutionButton":"Show solution","behaviour":{"enableRetry":true,"enableSolutionsButton":true,"enableCheckButton":true,"showScorePoints":true},"correctAnswer":"Correct!","incorrectAnswer":"Incorrect!","missedAnswer":"Answer not found!","displaySolutionDescription":"Task is updated to contain the solution.","scoreBarLabel":"You got :num out of :total points","a11yFullTextLabel":"Full readable text","a11yClickableTextLabel":"Full text where words can be marked","a11ySolutionModeHeader":"Solution mode","a11yCheckingHeader":"Checking mode","a11yCheck":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","a11yShowSolution":"Show the solution. The task will be marked with its correct solution.","a11yRetry":"Retry the task. Reset all responses and start the task over again.","textField":"<p>_Sentence_ *_Answer_* _RestSentence_</p>\\n","taskDescription":"<p>_TaskDescription_</p>\\n"}',
      modifiedJson:
        '{"media":{"disableImageZooming":false},"overallFeedback":[{"from":0,"to":59,"feedback":"You need to work harder"},{"from":60,"to":79,"feedback":"Good, but you can do better"},{"from":80,"to":89,"feedback":"Very good"},{"from":90,"to":100,"feedback":"Excellent"}],"checkAnswerButton":"Check","submitAnswerButton":"Submit","tryAgainButton":"Retry","showSolutionButton":"Show solution","behaviour":{"enableRetry":true,"enableSolutionsButton":true,"enableCheckButton":true,"showScorePoints":true},"correctAnswer":"Correct!","incorrectAnswer":"Incorrect!","missedAnswer":"Answer not found!","displaySolutionDescription":"Task is updated to contain the solution.","scoreBarLabel":"You got :num out of :total points","a11yFullTextLabel":"Full readable text","a11yClickableTextLabel":"Full text where words can be marked","a11ySolutionModeHeader":"Solution mode","a11yCheckingHeader":"Checking mode","a11yCheck":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","a11yShowSolution":"Show the solution. The task will be marked with its correct solution.","a11yRetry":"Retry the task. Reset all responses and start the task over again.","textField":"<p>_Sentence_ *_Answer_* _RestSentence_</p>\\n","taskDescription":"<p>_TaskDescription_</p>\\n"}',
      exampleId: "668314fb77c6ff00447b012f",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Mark_the_Word_665781e726e1eb5951e270e2.html",
      description:
        "Mark the Words is an interactive task in which the learner needs to click the correct words in a sentence or paragraph",
    },
    {
      labels: [
        {
          "*_Sentence_": "text",
        },
        {
          "#_Answer_": "text",
        },
        {
          _Tip_: "text",
        },
        {
          _Distractor_: "text",
        },
      ],
      hints: [],
      _id: "6663286ef219f8004453face",
      typeName: "Text Drag Words",
      category: "Q",
      repeatedString: "_Sentence_*_Answer_:_Tip_*",
      repeated2: "*_Distractor_*",
      repeated3: "",
      htmlSeparator: "      \\n     ",
      abstractParameter: {
        Sentences: [
          {
            _Sentence_: "text",
          },
          {
            _Answer_: "text",
          },
          {
            _Tip_: "text",
          },
        ],
        Distractors: [
          {
            _Distractor_: "text",
          },
        ],
      },
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBUZXh0IERyYWcgV29yZHMgVGVtcGxhdGUiLCJpZCI6IjY2NTcxMDY5MDgxMzlhYTE0NTU0MTViZiJ9",
      templateName: "my New Text Drag Words Template",
      originalJson:
        '{"media":{"disableImageZooming":false},"taskDescription":"Drag the words into the correct boxes","overallFeedback":[{"from":0,"to":59,"feedback":"You need to work harder"},{"from":60,"to":79,"feedback":"Good, but you can do better"},{"from":80,"to":89,"feedback":"Very Good"},{"from":90,"to":100,"feedback":"Excellent"}],"checkAnswer":"Check","submitAnswer":"Submit","tryAgain":"Retry","showSolution":"Show solution","dropZoneIndex":"Drop Zone @index.","empty":"Drop Zone @index is empty.","contains":"Drop Zone @index contains draggable @draggable.","ariaDraggableIndex":"@index of @count draggables.","tipLabel":"Show tip","correctText":"Correct!","incorrectText":"Incorrect!","resetDropTitle":"Reset drop","resetDropDescription":"Are you sure you want to reset this drop zone?","grabbed":"Draggable is grabbed.","cancelledDragging":"Cancelled dragging.","correctAnswer":"Correct answer:","feedbackHeader":"Feedback","behaviour":{"enableRetry":true,"enableSolutionsButton":true,"enableCheckButton":true,"instantFeedback":false},"scoreBarLabel":"You got :num out of :total points","a11yCheck":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","a11yShowSolution":"Show the solution. The task will be marked with its correct solution.","a11yRetry":"Retry the task. Reset all responses and start the task over again.","textField":"_Sentence_*_Answer_:_Tip_*","distractors":"*_Distractor_*"}',
      modifiedJson:
        '{"media":{"disableImageZooming":false},"taskDescription":"Drag the words into the correct boxes","overallFeedback":[{"from":0,"to":59,"feedback":"You need to work harder"},{"from":60,"to":79,"feedback":"Good, but you can do better"},{"from":80,"to":89,"feedback":"Very Good"},{"from":90,"to":100,"feedback":"Excellent"}],"checkAnswer":"Check","submitAnswer":"Submit","tryAgain":"Retry","showSolution":"Show solution","dropZoneIndex":"Drop Zone @index.","empty":"Drop Zone @index is empty.","contains":"Drop Zone @index contains draggable @draggable.","ariaDraggableIndex":"@index of @count draggables.","tipLabel":"Show tip","correctText":"Correct!","incorrectText":"Incorrect!","resetDropTitle":"Reset drop","resetDropDescription":"Are you sure you want to reset this drop zone?","grabbed":"Draggable is grabbed.","cancelledDragging":"Cancelled dragging.","correctAnswer":"Correct answer:","feedbackHeader":"Feedback","behaviour":{"enableRetry":true,"enableSolutionsButton":true,"enableCheckButton":true,"instantFeedback":false},"scoreBarLabel":"You got :num out of :total points","a11yCheck":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","a11yShowSolution":"Show the solution. The task will be marked with its correct solution.","a11yRetry":"Retry the task. Reset all responses and start the task over again.","textField":"_Sentence_*_Answer_:_Tip_*","distractors":"*_Distractor_*"}',
      exampleId: "66830b4fc1d8c4004435c696",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Text_Drag_Words_Template_66571069dd190264b88e2e98.html",
      description: " Drag the Words into the appropriate box",
    },
    {
      labels: [
        {
          _Heading_: "text",
        },
        {
          "*_Picture1_": "image",
        },
        {
          AltTextImage1: "text",
        },
        {
          _HoverTextImage1_: "text",
        },
        {
          _LabelImage1_: "text",
        },
        {
          "*_Picture2_": "image",
        },
        {
          _AltTextImage2_: "text",
        },
        {
          _HoverTextImage2_: "text",
        },
        {
          _LabelImage2_: "text",
        },
      ],
      hints: [],
      _id: "66634b5d47edf80043733901",
      typeName: "Image Juxtaposition",
      category: "X",
      repeatedString: "",
      repeated2: "",
      repeated3: "",
      htmlSeparator: "",
      abstractParameter: {
        _Heading_: "text",
        _Picture1_: "image",
        _AltTextImage1_: "text",
        _HoverTextImage1_: "text",
        _LabelImage1_: "text",
        _Picture2_: "image",
        _AltTextImage2_: "text",
        _HoverTextImage2_: "text",
        _LabelImage2_: "text",
      },
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBJbWFnZSBKdXh0YXBvc2l0aW9uIFRlbXBsYXRlIiwiaWQiOiI2NjNkMWRmNGY0OWRkNzRhYmFmZWNlYjAifQ==",
      templateName: "my New Image Juxtaposition Template",
      originalJson:
        '{"imageBefore":{"imageBefore":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","alt":"_AltTextImage1_","title":"_HoverTextImage1_","file":{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/imagePairingTemplate_1.jpg","mime":"image/jpg","copyright":{"license":"U"},"width":3840,"height":2160}},"library":"H5P.Image 1.1","subContentId":"7509d292-5bb0-41fd-9740-d64eb51e1f69","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]}},"labelBefore":"_LabelImage1_"},"imageAfter":{"imageAfter":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","alt":"_AltTextImage2_","title":"_HoverTextImage2_","file":{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/imagePairingTemplate_2.jpg","mime":"image/jpg","copyright":{"license":"U"},"width":3840,"height":2160}},"library":"H5P.Image 1.1","subContentId":"c1f4b565-d4ea-4de0-8121-9912bf2e1fea","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]}},"labelAfter":"_LabelImage2_"},"behavior":{"startingPosition":50,"sliderOrientation":"horizontal","sliderColor":"#f3f3f3"},"title":"_Heading_"}',
      modifiedJson:
        '{"imageBefore":{"imageBefore":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","alt":"_AltTextImage1_","title":"_HoverTextImage1_","file":{"path":"_Picture1_","mime":"image/jpg","copyright":{"license":"U"},"width":3840,"height":2160}},"library":"H5P.Image 1.1","subContentId":"7509d292-5bb0-41fd-9740-d64eb51e1f69","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]}},"labelBefore":"_LabelImage1_"},"imageAfter":{"imageAfter":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","alt":"_AltTextImage2_","title":"_HoverTextImage2_","file":{"path":"_Picture2_","mime":"image/jpg","copyright":{"license":"U"},"width":3840,"height":2160}},"library":"H5P.Image 1.1","subContentId":"c1f4b565-d4ea-4de0-8121-9912bf2e1fea","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]}},"labelAfter":"_LabelImage2_"},"behavior":{"startingPosition":50,"sliderOrientation":"horizontal","sliderColor":"#f3f3f3"},"title":"_Heading_"}',
      exampleId: "6683c03fd391ab00444e427e",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Image_Juxtaposition_Template_663d1df302c59ac2963f3d90.html",
      description:
        "Allows the User to compare two images interactively, moving a vertical slider or a horizontal slider between the two images.",
    },
    {
      labels: [
        {
          "*_Picture_": "image",
        },
        {
          _AltText_: "text",
        },
        {
          _HoverText_: "text",
        },
        {
          "#_Correct_": "Bool",
        },
      ],
      hints: [],
      _id: "66642841939fc20044c65faa",
      typeName: "Image MCQ",
      category: "Q",
      repeatedString:
        '{"media":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","alt":"_AltText_","title":"_HoverText_","file":{"path":"_Picture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}},"library":"H5P.Image 1.1","subContentId":"2bfb90fb-e68d-4883-bdf7-35072067da00","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]}},"correct":_Correct_}',
      repeated2: "",
      repeated3: "",
      htmlSeparator: ",",
      abstractParameter: {
        _Question_: "text",
        "Options 2": [
          {
            _Picture_: "image",
            _AltText_: "text",
            _HoverText_: "text",
            _Correct_: "Bool",
          },
        ],
      },
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBJbWFnZSBDaG9pY2UgVGVtcGxhdGUiLCJpZCI6IjY2NTFlZDRkYzhhZTBkZDA2NTQyOGI0MCJ9",
      templateName: "my New Image Choice Template",
      originalJson:
        '{"media":{"disableImageZooming":false},"options":[{"media":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","alt":"_AltText_","title":"_HoverText_","file":{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/templateImg.jpeg","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}},"library":"H5P.Image 1.1","subContentId":"2bfb90fb-e68d-4883-bdf7-35072067da00","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]}},"correct":false}],"overallFeedback":[{"from":0,"to":59,"feedback":"You need to study harder"},{"from":60,"to":79,"feedback":"Good, but you can do better"},{"from":80,"to":89,"feedback":"Very Good"},{"from":90,"to":100,"feedback":"Excellent"}],"behaviour":{"enableRetry":"true","enableSolutionsButton":"true","confirmCheckDialog":false,"confirmRetryDialog":false,"singlePoint":false,"showSolutionsRequiresInput":true,"questionType":"auto","aspectRatio":"auto","maxAlternativesPerRow":"4","passPercentage":100},"l10n":{"checkAnswerButtonText":"Check","submitAnswerButtonText":"Submit","checkAnswer":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","showSolutionButtonText":"Show solution","showSolution":"Show the solution. The correct options will be marked.","correctAnswer":"Correct answer","wrongAnswer":"Wrong answer","shouldCheck":"Should have been checked","shouldNotCheck":"Should not have been checked","noAnswer":"Please answer before viewing the solution","retryText":"Retry","retry":"Retry the task. Reset all responses and start the task over again.","result":"You got :num out of :total points","missingAltText":"Alt text missing","confirmCheck":{"header":"Finish?","body":"Are you sure you want to finish?","cancelLabel":"Cancel","confirmLabel":"Finish"},"confirmRetry":{"header":"Retry?","body":"Are you sure you wish to retry?","cancelLabel":"Cancel","confirmLabel":"Retry"}},"question":"<p>_Question_</p>\\n"}',
      modifiedJson:
        '{"media":{"disableImageZooming":false},"options":[{"media":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","alt":"_AltText_","title":"_HoverText_","file":{"path":"_Picture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}},"library":"H5P.Image 1.1","subContentId":"2bfb90fb-e68d-4883-bdf7-35072067da00","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]}},"correct":_Correct_}],"overallFeedback":[{"from":0,"to":59,"feedback":"You need to study harder"},{"from":60,"to":79,"feedback":"Good, but you can do better"},{"from":80,"to":89,"feedback":"Very Good"},{"from":90,"to":100,"feedback":"Excellent"}],"behaviour":{"enableRetry":"true","enableSolutionsButton":"true","confirmCheckDialog":false,"confirmRetryDialog":false,"singlePoint":false,"showSolutionsRequiresInput":true,"questionType":"auto","aspectRatio":"auto","maxAlternativesPerRow":"4","passPercentage":100},"l10n":{"checkAnswerButtonText":"Check","submitAnswerButtonText":"Submit","checkAnswer":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","showSolutionButtonText":"Show solution","showSolution":"Show the solution. The correct options will be marked.","correctAnswer":"Correct answer","wrongAnswer":"Wrong answer","shouldCheck":"Should have been checked","shouldNotCheck":"Should not have been checked","noAnswer":"Please answer before viewing the solution","retryText":"Retry","retry":"Retry the task. Reset all responses and start the task over again.","result":"You got :num out of :total points","missingAltText":"Alt text missing","confirmCheck":{"header":"Finish?","body":"Are you sure you want to finish?","cancelLabel":"Cancel","confirmLabel":"Finish"},"confirmRetry":{"header":"Retry?","body":"Are you sure you wish to retry?","cancelLabel":"Cancel","confirmLabel":"Retry"}},"question":"<p>_Question_</p>\\n"}',
      exampleId: "6683d4861e48e50045f77956",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Image_Choice_Template_6651ed4ac6395f21a2670e2b.html",
      description:
        "Image choice questions are like multiple choice text questions, but they use images for the choices. ",
    },
    {
      labels: [
        {
          "*_Question_": "text",
        },
        {
          "#_Answer_": "text",
        },
        {
          _Tip_: "text",
        },
      ],
      hints: [],
      _id: "66643cc34df1e8004465674a",
      typeName: "Fill The Blanks",
      category: "Q",
      repeatedString: '"<p>_Question_*_Answer_:_Tip_*</p>\\n"',
      repeated2: "",
      repeated3: "",
      htmlSeparator: ",",
      abstractParameter: {
        Questions: [
          {
            _Question_: "text",
            _Answer_: "text",
            _Tip_: "text",
          },
        ],
      },
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBGaWxsIHRoZSBCbGFua3MgVGVtcGxhdGUiLCJpZCI6IjY2NTcwY2E3MDgxMzlhODI3YTU0MTViZCJ9",
      templateName: "my New Fill the Blanks Template",
      originalJson:
        '{"media":{"disableImageZooming":false},"text":"Fill in the missing words","overallFeedback":[{"from":0,"to":59,"feedback":"You need to work harder"},{"from":60,"to":79,"feedback":"Good, but you can do better"},{"from":80,"to":89,"feedback":"Very Good"},{"from":90,"to":100,"feedback":"Excellent"}],"showSolutions":"Show solution","tryAgain":"Retry","checkAnswer":"Check","submitAnswer":"Submit","notFilledOut":"Please fill in all blanks to view solution","answerIsCorrect":"\':ans\' is correct","answerIsWrong":"\':ans\' is wrong","answeredCorrectly":"Answered correctly","answeredIncorrectly":"Answered incorrectly","solutionLabel":"Correct answer:","inputLabel":"Blank input @num of @total","inputHasTipLabel":"Tip available","tipLabel":"Tip","behaviour":{"enableRetry":true,"enableSolutionsButton":true,"enableCheckButton":true,"autoCheck":false,"caseSensitive":true,"showSolutionsRequiresInput":true,"separateLines":false,"confirmCheckDialog":false,"confirmRetryDialog":false,"acceptSpellingErrors":false},"scoreBarLabel":"You got :num out of :total points","a11yCheck":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","a11yShowSolution":"Show the solution. The task will be marked with its correct solution.","a11yRetry":"Retry the task. Reset all responses and start the task over again.","a11yCheckingModeHeader":"Checking mode","confirmCheck":{"header":"Finish ?","body":"Are you sure you wish to finish ?","cancelLabel":"Cancel","confirmLabel":"Finish"},"confirmRetry":{"header":"Retry ?","body":"Are you sure you wish to retry ?","cancelLabel":"Cancel","confirmLabel":"Confirm"},"questions":["<p>_Question_*_Answer_:_Tip_*</p>\\n"]}',
      modifiedJson:
        '{"media":{"disableImageZooming":false},"text":"Fill in the missing words","overallFeedback":[{"from":0,"to":59,"feedback":"You need to work harder"},{"from":60,"to":79,"feedback":"Good, but you can do better"},{"from":80,"to":89,"feedback":"Very Good"},{"from":90,"to":100,"feedback":"Excellent"}],"showSolutions":"Show solution","tryAgain":"Retry","checkAnswer":"Check","submitAnswer":"Submit","notFilledOut":"Please fill in all blanks to view solution","answerIsCorrect":"\':ans\' is correct","answerIsWrong":"\':ans\' is wrong","answeredCorrectly":"Answered correctly","answeredIncorrectly":"Answered incorrectly","solutionLabel":"Correct answer:","inputLabel":"Blank input @num of @total","inputHasTipLabel":"Tip available","tipLabel":"Tip","behaviour":{"enableRetry":true,"enableSolutionsButton":true,"enableCheckButton":true,"autoCheck":false,"caseSensitive":true,"showSolutionsRequiresInput":true,"separateLines":false,"confirmCheckDialog":false,"confirmRetryDialog":false,"acceptSpellingErrors":false},"scoreBarLabel":"You got :num out of :total points","a11yCheck":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","a11yShowSolution":"Show the solution. The task will be marked with its correct solution.","a11yRetry":"Retry the task. Reset all responses and start the task over again.","a11yCheckingModeHeader":"Checking mode","confirmCheck":{"header":"Finish ?","body":"Are you sure you wish to finish ?","cancelLabel":"Cancel","confirmLabel":"Finish"},"confirmRetry":{"header":"Retry ?","body":"Are you sure you wish to retry ?","cancelLabel":"Cancel","confirmLabel":"Confirm"},"questions":["<p>_Question_*_Answer_:_Tip_*</p>\\n"]}',
      exampleId: "6682fdd0e08a6a004422dc10",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Fill_the_Blanks_Template_66570ca7dd1902de7a8e2e97.html",
      description:
        "Complete the sentence by filling in the blank with the most appropriate word",
    },
    {
      labels: [
        {
          "*_DictationText_": "text",
        },
        {
          _DictationAudio_: "voice",
        },
      ],
      hints: [],
      _id: "6664b00b871e61004355492d",
      typeName: "Dictation",
      category: "Q",
      repeatedString: "",
      repeated2: "",
      repeated3: "",
      htmlSeparator: "",
      abstractParameter: {
        _DictationText_: "text",
        _DictationAudio_: "voice",
      },
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBEaWN0YXRpb24gVGVtcGxhdGUiLCJpZCI6IjY2NTcxZTQxMDgxMzlhZTkyMzU0MTVjMSJ9",
      templateName: "my New Dictation Template",
      originalJson:
        '{"media":{"disableImageZooming":false},"sentences":[{"text":"_DictationText_","sample":[{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/How-your-digestive-system-works-Emma-Bryce.mp3","mime":"audio/mp3","copyright":{"license":"U"}}]}],"overallFeedback":[{"from":0,"to":59,"feedback":"You need to study harder"},{"from":60,"to":79,"feedback":"Good, but you need to study more"},{"from":80,"to":89,"feedback":"Very good"},{"from":90,"to":100,"feedback":"Excellent"}],"behaviour":{"shuffleSentences":"never","scoring":{"ignorePunctuation":true,"zeroMistakeMode":false,"typoFactor":"100"},"textual":{"wordSeparator":" ","overrideRTL":"auto","autosplit":true},"feedbackPresentation":{"customTypoDisplay":false,"alternateSolution":"first"},"enableRetry":true,"enableSolutionsButton":true,"enableSolutionOnCheck":false},"l10n":{"generalFeedback":"You have made @total mistake(s).","generalFeedbackZeroMistakesMode":"You have entered @total word(s) correctly and @typo word(s) with minor mistakes.","checkAnswer":"Check","submitAnswer":"Submit","tryAgain":"Retry","showSolution":"Show solution","audioNotSupported":"Your browser does not support this audio."},"a11y":{"check":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","showSolution":"Show the solution. The task will be marked with its correct solution.","retry":"Retry the task. Reset all responses and start the task over again.","play":"Play","playSlowly":"Play slowly","triesLeft":"Number of tries left: @number","infinite":"infinite","enterText":"Enter what you have heard.","yourResult":"You got @score out of @total points","solution":"Solution","sentence":"Sentence","item":"Item","correct":"correct","wrong":"wrong","typo":"small mistake","missing":"missing","added":"added","shouldHaveBeen":"Should have been","or":"or","point":"point","points":"points","period":"period","exclamationPoint":"exclamation point","questionMark":"question mark","comma":"comma","singleQuote":"single quote","doubleQuote":"double quote","colon":"colon","semicolon":"semicolon","plus":"plus","minus":"minus","asterisk":"asterisk","forwardSlash":"forward slash"}}',
      modifiedJson:
        '{"media":{"disableImageZooming":false},"sentences":[{"text":"_DictationText_","sample":[{"path":"_DictationAudio_","mime":"audio/mp3","copyright":{"license":"U"}}]}],"overallFeedback":[{"from":0,"to":59,"feedback":"You need to study harder"},{"from":60,"to":79,"feedback":"Good, but you need to study more"},{"from":80,"to":89,"feedback":"Very good"},{"from":90,"to":100,"feedback":"Excellent"}],"behaviour":{"shuffleSentences":"never","scoring":{"ignorePunctuation":true,"zeroMistakeMode":false,"typoFactor":"100"},"textual":{"wordSeparator":" ","overrideRTL":"auto","autosplit":true},"feedbackPresentation":{"customTypoDisplay":false,"alternateSolution":"first"},"enableRetry":true,"enableSolutionsButton":true,"enableSolutionOnCheck":false},"l10n":{"generalFeedback":"You have made @total mistake(s).","generalFeedbackZeroMistakesMode":"You have entered @total word(s) correctly and @typo word(s) with minor mistakes.","checkAnswer":"Check","submitAnswer":"Submit","tryAgain":"Retry","showSolution":"Show solution","audioNotSupported":"Your browser does not support this audio."},"a11y":{"check":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","showSolution":"Show the solution. The task will be marked with its correct solution.","retry":"Retry the task. Reset all responses and start the task over again.","play":"Play","playSlowly":"Play slowly","triesLeft":"Number of tries left: @number","infinite":"infinite","enterText":"Enter what you have heard.","yourResult":"You got @score out of @total points","solution":"Solution","sentence":"Sentence","item":"Item","correct":"correct","wrong":"wrong","typo":"small mistake","missing":"missing","added":"added","shouldHaveBeen":"Should have been","or":"or","point":"point","points":"points","period":"period","exclamationPoint":"exclamation point","questionMark":"question mark","comma":"comma","singleQuote":"single quote","doubleQuote":"double quote","colon":"colon","semicolon":"semicolon","plus":"plus","minus":"minus","asterisk":"asterisk","forwardSlash":"forward slash"}}',
      exampleId: "668321e0012ba800446ec469",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Dictation_Template_66571e40dd190217498e2e99.html",
      description:
        "A dictation question refers to an exercise where the test taker listens to a passage being read aloud and writes down the text as they hear it",
    },
    {
      labels: [
        {
          "*_TaskDescription_": "text",
        },
        {
          "*_ParagraphText_": "text",
        },
      ],
      hints: [],
      _id: "6665df3df380750045173b71",
      typeName: "Sort Paragraphs",
      category: "Q",
      repeatedString: '"<p>_ParagraphText_</p>\\n"',
      repeated2: "",
      repeated3: "",
      htmlSeparator: ",",
      abstractParameter: {
        _TaskDescription_: "text",
        "Paragraphs 2": [
          {
            _ParagraphText_: "text",
          },
        ],
      },
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBTb3J0IFRleHQgVGVtcGxhdGUiLCJpZCI6IjY2MWQ0N2JkZWM1YjMzNDViODNjNTJiZiJ9",
      templateName: "my New Sort Text Template",
      originalJson:
        '{"media":{"disableImageZooming":false},"overallFeedback":[{"from":0,"to":59,"feedback":"You need to work harder"},{"from":60,"to":79,"feedback":"Good, but you can do better"},{"from":80,"to":89,"feedback":"Very good"},{"from":90,"to":100,"feedback":"Excellent"}],"behaviour":{"scoringMode":"positions","applyPenalties":false,"duplicatesInterchangeable":true,"addButtonsForMovement":true,"enableRetry":true,"enableSolutionsButton":true},"l10n":{"checkAnswer":"Check","submitAnswer":"Submit","tryAgain":"Retry","showSolution":"Show solution","up":"Up","down":"Down","disabled":"Disabled"},"a11y":{"check":"Check the answers. The responses will be marked as correct or incorrect.","showSolution":"Show the solution. The correct solution will be displayed.","retry":"Retry the task. Reset all elements and start the task over again.","yourResult":"You got @score out of @total points","listDescription":"Sortable list of paragraphs.","listDescriptionCheckAnswer":"List of paragraphs with results.","listDescriptionShowSolution":"List of paragraphs with solutions.","paragraph":"Paragraph","correct":"correct","wrong":"wrong","point":"@score point","sevenOfNine":"@current of @total","currentPosition":"Current position in list","instructionsSelected":"Press spacebar to reorder","instructionsGrabbed":"Press up and down arrow keys to change position, spacebar to drop, escape to cancel","grabbed":"Grabbed","moved":"Moved","dropped":"Dropped","reorderCancelled":"Reorder cancelled","finalPosition":"Final position","nextParagraph":"Next paragraph","correctParagraph":"Correct paragraph at position"},"taskDescription":"<p>_TaskDescription_</p>\\n","paragraphs":["<p>_ParagraphText_</p>\\n"]}',
      modifiedJson:
        '{"media":{"disableImageZooming":false},"overallFeedback":[{"from":0,"to":59,"feedback":"You need to work harder"},{"from":60,"to":79,"feedback":"Good, but you can do better"},{"from":80,"to":89,"feedback":"Very good"},{"from":90,"to":100,"feedback":"Excellent"}],"behaviour":{"scoringMode":"positions","applyPenalties":false,"duplicatesInterchangeable":true,"addButtonsForMovement":true,"enableRetry":true,"enableSolutionsButton":true},"l10n":{"checkAnswer":"Check","submitAnswer":"Submit","tryAgain":"Retry","showSolution":"Show solution","up":"Up","down":"Down","disabled":"Disabled"},"a11y":{"check":"Check the answers. The responses will be marked as correct or incorrect.","showSolution":"Show the solution. The correct solution will be displayed.","retry":"Retry the task. Reset all elements and start the task over again.","yourResult":"You got @score out of @total points","listDescription":"Sortable list of paragraphs.","listDescriptionCheckAnswer":"List of paragraphs with results.","listDescriptionShowSolution":"List of paragraphs with solutions.","paragraph":"Paragraph","correct":"correct","wrong":"wrong","point":"@score point","sevenOfNine":"@current of @total","currentPosition":"Current position in list","instructionsSelected":"Press spacebar to reorder","instructionsGrabbed":"Press up and down arrow keys to change position, spacebar to drop, escape to cancel","grabbed":"Grabbed","moved":"Moved","dropped":"Dropped","reorderCancelled":"Reorder cancelled","finalPosition":"Final position","nextParagraph":"Next paragraph","correctParagraph":"Correct paragraph at position"},"taskDescription":"<p>_TaskDescription_</p>\\n","paragraphs":["<p>_ParagraphText_</p>\\n"]}',
      exampleId: "",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Sort_Text_Template_661d47bc3e716d8eea45f621.html",
    },
    {
      labels: [
        {
          _Heading_: "text",
        },
        {
          "*_Picture_": "image",
        },
        {
          _AltText_: "text",
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
      hints: [],
      _id: "66689532cf87c300442665f1",
      typeName: "Image Blinder (Agamotto)",
      category: "X",
      repeatedString:
        '{"image":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","file":{"path":"_Picture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160},"alt":"_AltText_","title":"_HoverText_"},"library":"H5P.Image 1.1","subContentId":"3b5c6140-df96-43f4-af28-7a97058abb19","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]}},"labelText":"_Label_","description":"<p>_Description_</p>\\n"}',
      repeated2: "",
      repeated3: "",
      htmlSeparator: ",",
      abstractParameter: {
        _Heading_: "text",
        "Slides 2": [
          {
            _Picture_: "image",
            _AltText_: "text",
            _HoverText_: "text",
            _Label_: "text",
            _Description_: "text",
          },
        ],
      },
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBJbWFnZSBCbGluZGVyIChBZ2Ftb3R0bykgVGVtcGxhdGUiLCJpZCI6IjY2NWUwOTQxYTIwODk5NWQ0M2NiN2MyNSJ9",
      templateName: "my New Image Blinder (Agamotto) Template",
      originalJson:
        '{"items":[{"image":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","file":{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/templateImg.jpeg","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160},"alt":"_AltText_","title":"_HoverText_"},"library":"H5P.Image 1.1","subContentId":"3b5c6140-df96-43f4-af28-7a97058abb19","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]}},"labelText":"_Label_","description":"<p>_Description_</p>\\n"}],"behaviour":{"startImage":1,"snap":true,"ticks":false,"labels":false,"transparencyReplacementColor":"#000000"},"a11y":{"image":"Image","imageSlider":"Image Slider"},"title":"_Heading_"}',
      modifiedJson:
        '{"items":[{"image":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","file":{"path":"_Picture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160},"alt":"_AltText_","title":"_HoverText_"},"library":"H5P.Image 1.1","subContentId":"3b5c6140-df96-43f4-af28-7a97058abb19","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]}},"labelText":"_Label_","description":"<p>_Description_</p>\\n"}],"behaviour":{"startImage":1,"snap":true,"ticks":false,"labels":false,"transparencyReplacementColor":"#000000"},"a11y":{"image":"Image","imageSlider":"Image Slider"},"title":"_Heading_"}',
      exampleId: "66830a6e82683600436f8c44",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Image_Blinder_(Agamotto)_Template_665e0940aa429912033d73ca.html",
      description:
        "Present a sequence of images and explanations in an interactive way. ",
    },
    {
      labels: [
        {
          "*_Title_": "text",
        },
        {
          "*_Text_": "text",
        },
      ],
      hints: [],
      _id: "6669aada6ae2a50044e887eb",
      typeName: "Accordion",
      category: "X",
      repeatedString:
        '{"content":{"params":{"text":"<p>_Text_</p>\\n"},"library":"H5P.AdvancedText 1.1","subContentId":"3f62313f-04d9-4fb3-ae3c-0d2fd986c023","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]}},"title":"_Title_"}',
      repeated2: "",
      repeated3: "",
      htmlSeparator: ",",
      abstractParameter: {
        Panels: [
          {
            _Title_: "text",
          },
          {
            _Text_: "text",
          },
        ],
      },
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBBY2NvcmRpb24gVGVucGxhdGUiLCJpZCI6IjY2NWUxYWI5YTIwODk5MjFlYmNiN2MyYiJ9",
      templateName: "my New Accordion Template",
      originalJson:
        '{"panels":[{"content":{"params":{"text":"<p>_Text_</p>\\n"},"library":"H5P.AdvancedText 1.1","subContentId":"3f62313f-04d9-4fb3-ae3c-0d2fd986c023","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]}},"title":"_Title_"}],"hTag":"h4"}',
      modifiedJson:
        '{"panels":[{"content":{"params":{"text":"<p>_Text_</p>\\n"},"library":"H5P.AdvancedText 1.1","subContentId":"3f62313f-04d9-4fb3-ae3c-0d2fd986c023","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]}},"title":"_Title_"}],"hTag":"h4"}',
      exampleId: "6683c892bdc8c5004436bcf9",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Accordion_Tenplate_665e1ab8aa429909483d73cd.html",
      description:
        "Accordion is a way to reduce the amount of text presented to readers - who can take a closer look by expanding the title. The accordion is excellent for providing an overview with optional in-depth explanations.",
    },
    {
      labels: [
        {
          "*_TaskDescription_": "text",
        },
        {
          "*_Picture_": "image",
        },
        {
          _AltITextPicture_: "text",
        },
        {
          "*_MatchingPicture_": "image",
        },
        {
          _AltTextMatchingPicture_: "text",
        },
      ],
      hints: [],
      _id: "6669fdf830ae890044f6626f",
      typeName: "Image Pairing",
      category: "G",
      repeatedString:
        '{"imageAlt":"_AltTextPicture_","matchAlt":"_AltTextMatchingPicture_","image":{"path":"_Picture_","mime":"image/jpg","copyright":{"license":"U"},"width":3840,"height":2160},"match":{"path":"_MatchingPicture_","mime":"image/jpg","copyright":{"license":"U"},"width":3840,"height":2160}}',
      repeated2: "",
      repeated3: "",
      htmlSeparator: ",",
      abstractParameter: {
        _TaskDescription_: "text",
        "Cards 2": [
          {
            _Picture_: "image",
            _AltITextPicture_: "text",
            _MatchingPicture_: "image",
            _AltTextMatchingPicture_: "text",
          },
        ],
      },
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBJbWFnZSBQYWlyaW5nIFRlbXBsYXRlIiwiaWQiOiI2NjUxYmQ1NWM4YWUwZDg5NWQ0MjhiMzgifQ==",
      templateName: "my New Image Pairing Template",
      originalJson:
        '{"taskDescription":"_TaskDescription_","cards":[{"imageAlt":"_AltTextPicture_","matchAlt":"_AltTextMatchingPicture_","image":{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/imagePairingTemplate_1.jpg","mime":"image/jpg","copyright":{"license":"U"},"width":3840,"height":2160},"match":{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/imagePairingTemplate_2.jpg","mime":"image/jpg","copyright":{"license":"U"},"width":3840,"height":2160}}],"behaviour":true,"l10n":{"checkAnswer":"Check","tryAgain":"Retry","showSolution":"Show Solution","score":"You got @score of @total points"}}',
      modifiedJson:
        '{"taskDescription":"_TaskDescription_","cards":[{"imageAlt":"_AltTextPicture_","matchAlt":"_AltTextMatchingPicture_","image":{"path":"_Picture_","mime":"image/jpg","copyright":{"license":"U"},"width":3840,"height":2160},"match":{"path":"_MatchingPicture_","mime":"image/jpg","copyright":{"license":"U"},"width":3840,"height":2160}}],"behaviour":true,"l10n":{"checkAnswer":"Check","tryAgain":"Retry","showSolution":"Show Solution","score":"You got @score of @total points"}}',
      exampleId: "6683e6f9010aa8004411afc1",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Image_Pairing_Template_6651bd51c6395f1a73670e27.html",
      description:
        "Image pairing is a simple and effective activity that requires learners to match pairs of images.",
    },
    {
      labels: [
        {
          _Title_: "text",
        },
        {
          "*_TaskDescription_": "text",
        },
        {
          _HotspotName_: "text",
        },
        {
          "*_Picture_": "image",
        },
        {
          "*_Xposition_": "Coordinate",
        },
        {
          "*_Yposition_": "Coordinate",
        },
        {
          _Feedback_: "text",
        },
        {
          "#_Correct_": "Bool",
        },
      ],
      hints: [
        {
          _Xposition_: "Please copy x value to the field",
        },
        {
          _Yposition_: "Please copy y value to the field",
        },
      ],
      _id: "666b7ea239f4410044091f85",
      typeName: "Image Multiple Hotspot Question",
      templateName: "my New Image Multiple Hotspot Question Template",
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBJbWFnZSBIb3RzcG90IFF1ZXN0aW9uIFRlbXBsYXRlIiwiaWQiOiI2NjUxZGUxMGM4YWUwZDIzMTA0MjhiM2MifQ==",
      htmlSeparator: ",",
      repeatedString:
        '{"userSettings":{"correct":_Correct_,"feedbackText":"_FeedBack_"},"computedSettings":{"x":_Xposition_,"y":_Yposition_,"width":3.44352033047,"height":6.1244990441386005,"figure":"circle"}}',
      repeated2: "",
      repeated3: "",
      abstractParameter: {
        _Title_: "text",
        _TaskDescription_: "text",
        _HotspotName_: "text",
        _Picture_: "image",
        hotSpots: [
          {
            _Xposition_: "Coordinate",
            _Yposition_: "Coordinate",
            _Feedback_: "text",
            _Correct_: "Bool",
          },
        ],
      },
      modifiedJson:
        '{"imageMultipleHotspotQuestion":{"backgroundImageSettings":{"questionTitle":"_Title_","backgroundImage":{"path":"_Picture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}},"hotspotSettings":{"hotspot":[{"userSettings":{"correct":_Correct_,"feedbackText":"_FeedBack_"},"computedSettings":{"x":_Xposition_,"y":_Yposition_,"width":3.44352033047,"height":6.1244990441386005,"figure":"circle"}}],"taskDescription":"_TaskDescription_","hotspotName":"_HotspotName_","noneSelectedFeedback":"You did not locate any correct hotspots! Try again","alreadySelectedFeedback":"You have already found this one!"}}}',
      exampleId: "",
      originalJson:
        '{"imageMultipleHotspotQuestion":{"backgroundImageSettings":{"questionTitle":"_Title_","backgroundImage":{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/templateImg.jpeg","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}},"hotspotSettings":{"hotspot":[{"userSettings":{"correct":true,"feedbackText":"_FeedBack_"},"computedSettings":{"x":33.321919618337624,"y":42.898377828484115,"width":3.44352033047,"height":6.1244990441386005,"figure":"circle"}}],"taskDescription":"_TaskDescription_","hotspotName":"_HotspotName_","noneSelectedFeedback":"You did not locate any correct hotspots! Try again","alreadySelectedFeedback":"You have already found this one!"}}}',
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Image_Multiple_Hotspot_Question_Template_6651de0ec6395f54e8670e29.html",
    },
    {
      labels: [
        {
          "*_EssayQuestion_": "text",
        },
        {
          "#_EssayModelAnswer_": "text",
        },
        {
          _Help_: "text",
        },
      ],
      hints: [],
      _id: "666b83ad7131dd0045d5c26a",
      typeName: "Essay",
      templateName: "my New Essay Template",
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBFc3NheSBUZW1wbGF0ZSIsImlkIjoiNjYzZDE3ZTBmNDlkZDdjNmY5ZmVjZWFlIn0=",
      htmlSeparator: "",
      repeatedString: "",
      repeated2: "",
      repeated3: "",
      abstractParameter: {
        _EssayQuestion_: "text",
        _EssayModelAnswer_: "text",
        _Help_: "text",
      },
      modifiedJson:
        '{"media":{"disableImageZooming":false},"solution":{"sample":"<div>_EssayModelAnswer_</div>\\n","introduction":""},"keywords":[{"options":{"points":1,"occurrences":1,"caseSensitive":true,"forgiveMistakes":false,"feedbackIncludedWord":"keyword","feedbackMissedWord":"none"},"keyword":"_Keyword_"}],"overallFeedback":[{"from":0,"to":69,"feedback":"You need to work harder"},{"from":70,"to":79,"feedback":"Ok, but you can do better"},{"from":80,"to":89,"feedback":"Very Good"},{"from":90,"to":100,"feedback":"Excellent"}],"behaviour":{"inputFieldSize":"10","enableRetry":true,"ignoreScoring":false,"pointsHost":1,"linebreakReplacement":"\\n","percentagePassing":50,"overrideCaseSensitive":"off","overrideForgiveMistakes":"on"},"checkAnswer":"Check","submitAnswer":"Submit","tryAgain":"Retry","showSolution":"Show solution","feedbackHeader":"Feedback","solutionTitle":"Sample solution","remainingChars":"Remaining characters: @chars","notEnoughChars":"You must enter at least @chars characters!","messageSave":"saved","ariaYourResult":"You got @score out of @total points","ariaNavigatedToSolution":"Navigated to newly included sample solution after textarea.","ariaCheck":"Check the answers.","ariaShowSolution":"Show the solution. You will be provided with a sample solution.","ariaRetry":"Retry the task. You can improve your previous answer if the author allowed that.","taskDescription":"<p>_EssayQuestion_</p>\\n","placeholderText":"_Help_"}',
      exampleId: "6683d1ebf60ab3004487fec6",
      originalJson:
        '{"media":{"disableImageZooming":false},"solution":{"sample":"<div>_EssayModelAnswer_</div>\\n","introduction":""},"keywords":[{"options":{"points":1,"occurrences":1,"caseSensitive":true,"forgiveMistakes":false,"feedbackIncludedWord":"keyword","feedbackMissedWord":"none"},"keyword":"_Keyword_"}],"overallFeedback":[{"from":0,"to":69,"feedback":"You need to work harder"},{"from":70,"to":79,"feedback":"Ok, but you can do better"},{"from":80,"to":89,"feedback":"Very Good"},{"from":90,"to":100,"feedback":"Excellent"}],"behaviour":{"inputFieldSize":"10","enableRetry":true,"ignoreScoring":false,"pointsHost":1,"linebreakReplacement":"\\n","percentagePassing":50,"overrideCaseSensitive":"off","overrideForgiveMistakes":"on"},"checkAnswer":"Check","submitAnswer":"Submit","tryAgain":"Retry","showSolution":"Show solution","feedbackHeader":"Feedback","solutionTitle":"Sample solution","remainingChars":"Remaining characters: @chars","notEnoughChars":"You must enter at least @chars characters!","messageSave":"saved","ariaYourResult":"You got @score out of @total points","ariaNavigatedToSolution":"Navigated to newly included sample solution after textarea.","ariaCheck":"Check the answers.","ariaShowSolution":"Show the solution. You will be provided with a sample solution.","ariaRetry":"Retry the task. You can improve your previous answer if the author allowed that.","taskDescription":"<p>_EssayQuestion_</p>\\n","placeholderText":"_Help_"}',
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Essay_Template_663d17de02c59afbd53f3d8f.html",
      category: "Q",
      description:
        "An essay question typically requires you to compose a written response that explores and discusses a specific topic or issue.",
    },
    {
      labels: [
        {
          "*_TaskDescription_": "text",
        },
        {
          "*_Picture_": "image",
        },
        {
          _AltText_: "text",
        },
      ],
      hints: [],
      _id: "666b85437131dd0045d5c275",
      typeName: "Sort Images",
      templateName: "my New Sort Images Template",
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBTb3J0IEltYWdlcyBUZW1wbGF0ZSIsImlkIjoiNjYxZDVjNDllYzViMzMzNmE3M2M1MmMxIn0=",
      htmlSeparator: ",",
      repeatedString:
        '{"imageDescription":"_AltText_","image":{"path":"_Picture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}}',
      repeated2: "",
      repeated3: "",
      abstractParameter: {
        _TaskDescription_: "text",
        "SequenceImages 3": [
          {
            _Picture_: "image",
            _AltText_: "text",
          },
        ],
      },
      modifiedJson:
        '{"taskDescription":"_TaskDescription_","altTaskDescription":"Drag to arrange the images in the correct sequence","sequenceImages":[{"imageDescription":"_AltText_","image":{"path":"_Picture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}}],"behaviour":{"enableSolution":true,"enableRetry":true,"enableResume":true},"l10n":{"totalMoves":"Total Moves","timeSpent":"Time spent","score":"You got @score of @total points","checkAnswer":"Check","tryAgain":"Retry","showSolution":"ShowSolution","resume":"Resume","audioNotSupported":"Audio Error","ariaPlay":"Play the corresponding audio","ariaMoveDescription":"Moved @cardDesc from @posSrc to @posDes","ariaCardDesc":"sequencing item"}}',
      exampleId: "",
      originalJson:
        '{"taskDescription":"_TaskDescription_","altTaskDescription":"Drag to arrange the images in the correct sequence","sequenceImages":[{"imageDescription":"_AltText_","image":{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/sortImageTemplateImg.jpeg","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}}],"behaviour":{"enableSolution":true,"enableRetry":true,"enableResume":true},"l10n":{"totalMoves":"Total Moves","timeSpent":"Time spent","score":"You got @score of @total points","checkAnswer":"Check","tryAgain":"Retry","showSolution":"ShowSolution","resume":"Resume","audioNotSupported":"Audio Error","ariaPlay":"Play the corresponding audio","ariaMoveDescription":"Moved @cardDesc from @posSrc to @posDes","ariaCardDesc":"sequencing item"}}',
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Sort_Images_Template_661d5c463e716d3ace45f622.html",
    },
    {
      labels: [
        {
          _Heading_: "text",
        },
        {
          "*_TaskDescription_": "text",
        },
        {
          "*_CardHeadText_": "text",
        },
        {
          "*_CardTailText_": "text",
        },
        {
          _HeadTip_: "text",
        },
        {
          _TailTip_: "text",
        },
        {
          _OptionalPicture_: "image",
        },
      ],
      hints: [],
      _id: "666b86997131dd0045d5c27a",
      typeName: "Dialog Cards",
      templateName: "my New Dialog Cards Template",
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBEaWFsb2cgQ2FyZHMgVGVtcGxhdGUiLCJpZCI6IjY2MWQ3ZDc5NDljZWI1ODJiNjhjOTNmNyJ9",
      htmlSeparator: ",",
      repeatedString:
        '{"text":"<p style=\\"text-align:center\\">_CardHeadText_</p>\\n","answer":"<p>_CardTailText_</p>\\n","tips":{"front":"_HeadTip_","back":"_TailTip_"},"imageAltText":"_AltText_","image":{"path":"_OptionalPicture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}}',
      repeated2: "",
      repeated3: "",
      abstractParameter: {
        _Heading_: "text",
        _TaskDescription_: "text",
        DialogCards: [
          {
            _CardHeadText_: "text",
            _CardTailText_: "text",
            _HeadTip_: "text",
            _TailTip_: "text",
            _OptionalPicture_: "image",
          },
        ],
      },
      modifiedJson:
        '{"mode":"normal","dialogs":[{"text":"<p style=\\"text-align:center\\">_CardHeadText_</p>\\n","answer":"<p>_CardTailText_</p>\\n","tips":{"front":"_HeadTip_","back":"_TailTip_"},"imageAltText":"_AltText_","image":{"path":"_OptionalPicture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}}],"behaviour":{"enableRetry":true,"disableBackwardsNavigation":false,"scaleTextNotCard":false,"randomCards":true,"maxProficiency":5,"quickProgression":false},"answer":"Turn","next":"Next","prev":"Previous","retry":"Retry","correctAnswer":"I got it right!","incorrectAnswer":"I got it wrong","round":"Round @round","cardsLeft":"Cards left: @number","nextRound":"Proceed to round @round","startOver":"Start over","showSummary":"Next","summary":"Summary","summaryCardsRight":"Cards you got right:","summaryCardsWrong":"Cards you got wrong:","summaryCardsNotShown":"Cards in pool not shown:","summaryOverallScore":"Overall Score","summaryCardsCompleted":"Cards you have completed learning:","summaryCompletedRounds":"Completed rounds:","summaryAllDone":"Well done! You have mastered all @cards cards by getting them correct @max times!","progressText":"Card @card of @total","cardFrontLabel":"Card front","cardBackLabel":"Card back","tipButtonLabel":"Show tip","audioNotSupported":"Your browser does not support this audio","confirmStartingOver":{"header":"Start over?","body":"All progress will be lost. Are you sure you want to start over?","cancelLabel":"Cancel","confirmLabel":"Start over"},"title":"<p>_Heading_</p>\\n","description":"<p>_TaskDescription_</p>\\n"}',
      exampleId: "6682f7f046f380004414405f",
      originalJson:
        '{"mode":"normal","dialogs":[{"text":"<p style=\\"text-align:center\\">_CardHeadText_</p>\\n","answer":"<p>_CardTailText_</p>\\n","tips":{"front":"_HeadTip_","back":"_TailTip_"},"imageAltText":"_AltText_","image":{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/templateImg.jpeg","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}}],"behaviour":{"enableRetry":true,"disableBackwardsNavigation":false,"scaleTextNotCard":false,"randomCards":true,"maxProficiency":5,"quickProgression":false},"answer":"Turn","next":"Next","prev":"Previous","retry":"Retry","correctAnswer":"I got it right!","incorrectAnswer":"I got it wrong","round":"Round @round","cardsLeft":"Cards left: @number","nextRound":"Proceed to round @round","startOver":"Start over","showSummary":"Next","summary":"Summary","summaryCardsRight":"Cards you got right:","summaryCardsWrong":"Cards you got wrong:","summaryCardsNotShown":"Cards in pool not shown:","summaryOverallScore":"Overall Score","summaryCardsCompleted":"Cards you have completed learning:","summaryCompletedRounds":"Completed rounds:","summaryAllDone":"Well done! You have mastered all @cards cards by getting them correct @max times!","progressText":"Card @card of @total","cardFrontLabel":"Card front","cardBackLabel":"Card back","tipButtonLabel":"Show tip","audioNotSupported":"Your browser does not support this audio","confirmStartingOver":{"header":"Start over?","body":"All progress will be lost. Are you sure you want to start over?","cancelLabel":"Cancel","confirmLabel":"Start over"},"title":"<p>_Heading_</p>\\n","description":"<p>_TaskDescription_</p>\\n"}',
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Dialog_Cards_Template_661d7d76f3498a770104807f.html",
      category: "X",
      description:
        "help learners memorize words, expressions or sentences. Dialog cards provide a prompt on one side of the card, and a corresponding answer on the other side",
    },
    {
      labels: [
        {
          _TaskDescription_: "text",
        },
        {
          "*_Question_": "text",
        },
        {
          _Picture_: "image",
        },
        {
          _AltText_: "text",
        },
        {
          "*_Answer_": "text",
        },
        {
          _Tip_: "text",
        },
      ],
      hints: [],
      _id: "666b87307131dd0045d5c27f",
      typeName: "Flash Cards",
      templateName: "my New Flash Cards Template",
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBGbGFzIENhcmRzIFRlbXBsYXRlIiwiaWQiOiI2NjFjNWM1NDRmZTgwMjdlNDA2YjFhNDIifQ==",
      htmlSeparator: ",",
      repeatedString:
        '{"text":"_Question_","answer":"_Answer_","imageAltText":"_AltText_","tip":"<p>_Tip_</p>\\n","image":{"path":"_Picture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}}',
      repeated2: "",
      repeated3: "",
      abstractParameter: {
        _TaskDescription_: "text",
        Cards: [
          {
            _Question_: "text",
            _Picture_: "image",
            _AltText_: "text",
            _Answer_: "text",
            _Tip_: "text",
          },
        ],
      },
      modifiedJson:
        '{"cards":[{"text":"_Question_","answer":"_Answer_","imageAltText":"_AltText_","tip":"<p>_Tip_</p>\\n","image":{"path":"_Picture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}}],"progressText":"Card @card of @total","next":"Next","previous":"Previous","checkAnswerText":"Check","showSolutionsRequiresInput":true,"defaultAnswerText":"Your answer","correctAnswerText":"Correct","incorrectAnswerText":"Incorrect","showSolutionText":"Correct answer(s)","results":"Results","ofCorrect":"@score of @total correct","showResults":"Show results","answerShortText":"A:","retry":"Retry","caseSensitive":false,"cardAnnouncement":"Incorrect answer. Correct answer was @answer","correctAnswerAnnouncement":"@answer is correct.","pageAnnouncement":"Page @current of @total","randomCards":true,"description":"_TaskDescription_"}',
      exampleId: "66830beec1d8c4004435c6b4",
      originalJson:
        '{"cards":[{"text":"_Question_","answer":"_Answer_","imageAltText":"_AltText_","tip":"<p>_Tip_</p>\\n","image":{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/flashCardsTemplateImg.jpg","mime":"image/jpg","copyright":{"license":"U"},"width":3840,"height":2160}}],"progressText":"Card @card of @total","next":"Next","previous":"Previous","checkAnswerText":"Check","showSolutionsRequiresInput":true,"defaultAnswerText":"Your answer","correctAnswerText":"Correct","incorrectAnswerText":"Incorrect","showSolutionText":"Correct answer(s)","results":"Results","ofCorrect":"@score of @total correct","showResults":"Show results","answerShortText":"A:","retry":"Retry","caseSensitive":false,"cardAnnouncement":"Incorrect answer. Correct answer was @answer","correctAnswerAnnouncement":"@answer is correct.","pageAnnouncement":"Page @current of @total","randomCards":true,"description":"_TaskDescription_"}',
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Flas_Cards_Template_661c5c511163f9d340a58099.html",
      category: "X",
      description:
        "A card may contain words, numbers, or pictures with explanation as a learning aid",
    },
    {
      labels: [
        {
          _Picture_: "image",
        },
        {
          _AltText_: "text",
        },
        {
          Spot: "Coordinate",
        },
        {
          _Header_: "text",
        },
        {
          _HotSpotText_: "text",
        },
        {
          _HotSpotText2_: "text",
        },
      ],
      hints: [],
      _id: "666b88007131dd0045d5c28a",
      typeName: "Hotspot Image",
      templateName: "my New Image Hotspot Template",
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBJbWFnZSBIb3RzcG90IFRlbXBsYXRlIiwiaWQiOiI2NjNjYjRkZWY0OWRkNzg0MzVmZWNlYTYifQ==",
      htmlSeparator: '","',
      repeatedString:
        '{"position":{"x":_XPosition_,"y":_YPosition_},"alwaysFullscreen":false,"content":[{"params":{"text":"<p>_HotspotText_</p>\\n"},"library":"H5P.Text 1.1","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]},"subContentId":"7d3b3bd1-931f-4249-9ac9-08beab5cc020"},{"params":{"text":"<p>_HotspostText2_</p>\\n"},"library":"H5P.Text 1.1","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]},"subContentId":"a64bd202-9e7b-497e-8794-6c1d34ce74e2"}],"header":"_Header_"}',
      repeated2:
        '{"position":{"x":_XPosition_,"y":_YPosition_},"alwaysFullscreen":false,"content":[{"params":{"text":"<p>_HotspotText_</p>\\n"},"library":"H5P.Text 1.1","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]},"subContentId":"7d3b3bd1-931f-4249-9ac9-08beab5cc020"},{"params":{"text":"<p>_HotspostText2_</p>\\n"},"library":"H5P.Text 1.1","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]},"subContentId":"a64bd202-9e7b-497e-8794-6c1d34ce74e2"}],"header":"_Header_"}',
      repeated3:
        '{"position":{"x":_XPosition_,"y":_YPosition_},"alwaysFullscreen":false,"content":[{"params":{"text":"<p>_HotspotText_</p>\\n"},"library":"H5P.Text 1.1","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]},"subContentId":"7d3b3bd1-931f-4249-9ac9-08beab5cc020"},{"params":{"text":"<p>_HotspostText2_</p>\\n"},"library":"H5P.Text 1.1","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]},"subContentId":"a64bd202-9e7b-497e-8794-6c1d34ce74e2"}],"header":"_Header_"}',
      abstractParameter: {
        _Picture_: "image",
        _AltText_: "text",
        hotSpots: [
          {
            _Xposition_: "Coordinate",
            _Yposition_: "Coordinate",
            _Header_: " text",
            _HotSpotText_: "text",
            _HotSpotText2_: "text",
          },
        ],
      },
      modifiedJson:
        '"jsonContent": "{"iconType":"icon","icon":"plus","color":"#981d99","hotspots":[{"position":{"x":_Xposition_,"y":_Yposition_},"alwaysFullscreen":false,"content":[{"params":{"text":"<p>_HotspotText_</p>\\n"},"library":"H5P.Text 1.1","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]},"subContentId":"7d3b3bd1-931f-4249-9ac9-08beab5cc020"},{"params":{"text":"<p>_HotspostText2_</p>\\n"},"library":"H5P.Text 1.1","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]},"subContentId":"a64bd202-9e7b-497e-8794-6c1d34ce74e2"}],"header":"_Header_"}],"hotspotNumberLabel":"Hotspot #num","closeButtonLabel":"Close","image":{"path":"_Picture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160},"backgroundImageAltText":"_AltText_"}",',
      exampleId: "666b88007131dd0045d5c28a",
      originalJson:
        '"jsonContent": "{"iconType":"icon","icon":"plus","color":"#981d99","hotspots":[{"position":{"x":65.69930572509766,"y":59.712711003111366},"alwaysFullscreen":false,"content":[{"params":{"text":"<p>_HotspotText_</p>\\n"},"library":"H5P.Text 1.1","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]},"subContentId":"7d3b3bd1-931f-4249-9ac9-08beab5cc020"},{"params":{"text":"<p>_HotspostText2_</p>\\n"},"library":"H5P.Text 1.1","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]},"subContentId":"a64bd202-9e7b-497e-8794-6c1d34ce74e2"}],"header":"_Header_"}],"hotspotNumberLabel":"Hotspot #num","closeButtonLabel":"Close","image":{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/templateImg.jpeg","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160},"backgroundImageAltText":"_AltText_"}",',
      category: "X",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Image_Hotspot_Template_663cb4dd02c59ab6213f3d8b.html",
      description:
        "An image hotspot is a specific area within an image that has been designated as a link to another page or piece of content.",
    },
    {
      labels: [
        {
          "*_Video_": "video",
        },
        {
          _VideoDescription_: "text",
        },
        {
          _InteractionTimeFrom_: "timeStamp",
        },
        {
          _InteractionTimeTo_: "timeStamp",
        },
        {
          _InteractionLabel_: "text",
        },
        {
          _InteractionLabelText_: "text",
        },
        {
          _SectionTime_: "timeStamp",
        },
        {
          _SectionLabel_: "timeStamp",
        },
        {
          _Summary_: "text",
        },
      ],
      hints: [],
      _id: "666b89417131dd0045d5c28f",
      typeName: "Interactive Video",
      templateName: "my New Interactive Video Template",
      templateId:
        "eyJ0aXRsZSI6Im15IEludGVyYWN0aXZlIFZpZGVvIHRlbXBsYXRlIiwiaWQiOiI2NjNjZjFmMGY0OWRkNzMzYzRmZWNlYWEifQ==",
      htmlSeparator: ",",
      repeatedString:
        '{"x":47.81280672952277,"y":46.117677416350745,"width":10,"height":10,"duration":{"from":_InteractionTimeFrom_,"to":_InteractionTimeTo_},"libraryTitle":"Text","action":{"library":"H5P.Text 1.1","params":{"text":"<p>_InteractionLabelText_</p>\\n"},"subContentId":"fb2f5931-4d3e-4a72-81b2-3d1b21f6bbe7","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]}},"pause":true,"displayType":"button","buttonOnMobile":false,"visuals":{"backgroundColor":"rgb(255, 255, 255)","boxShadow":true},"goto":{"url":{"protocol":"http://"},"visualize":false,"type":""},"label":"<p>_InteractionLabel_</p>\\n"}',
      repeated2: '{"time":_SectionTime_,"label":"_SectionLabel_"}',
      repeated3: "",
      abstractParameter: {
        _Video_: "video",
        _VideoDescription_: "text",
        Interactions: [
          {
            _InteractionTimeFrom_: "timeStamp",
            _InteractionTimeTo_: "timeStamp",
            _InteractionLabel_: "text",
            _InteractionLabelText_: "text",
          },
        ],
        Sections: [
          {
            _SectionTime_: "timeStamp",
            _SectionLabel_: "timeStamp",
          },
        ],
        _Summary_: "text",
      },
      modifiedJson:
        '{"interactiveVideo":{"video":{"startScreenOptions":{"title":"Interactive Video","hideStartTitle":true,"shortStartDescription":"_VideoDescription_"},"textTracks":{"videoTrack":[{"label":"Subtitles","kind":"subtitles","srcLang":"_TrackLang_"}]},"files":[{"path":"_Video_","mime":"video/mp4","copyright":{"license":"U"}}]},"assets":{"interactions":[{"x":47.81280672952277,"y":46.117677416350745,"width":10,"height":10,"duration":{"from":_InteractionTimeFrom_,"to":_InteractionTimeTo_},"libraryTitle":"Text","action":{"library":"H5P.Text 1.1","params":{"text":"<p>_InteractionLabelText_</p>\\n"},"subContentId":"fb2f5931-4d3e-4a72-81b2-3d1b21f6bbe7","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]}},"pause":true,"displayType":"button","buttonOnMobile":false,"visuals":{"backgroundColor":"rgb(255, 255, 255)","boxShadow":true},"goto":{"url":{"protocol":"http://"},"visualize":false,"type":""},"label":"<p>_InteractionLabel_</p>\\n"}],"bookmarks":[{"time":_SectionTime_,"label":"_SectionLabel_"}],"endscreens":[{"time":296.518821,"label":"4:56 Submit screen"}]},"summary":{"task":{"library":"H5P.Summary 1.10","params":{"intro":"<p>Video Summary</p>\\n","summaries":[{"subContentId":"8c23eeba-33a1-4f51-9fa5-8ba38cbe833e","summary":["<p>_Summary_</p>\\n"],"tip":""}],"overallFeedback":[{"from":0,"to":100}],"solvedLabel":"Progress:","scoreLabel":"Wrong answers:","resultLabel":"Your result","labelCorrect":"Correct.","labelIncorrect":"Incorrect! Please try again.","alternativeIncorrectLabel":"Incorrect","labelCorrectAnswers":"Correct answers.","tipButtonLabel":"Show tip","scoreBarLabel":"You got :num out of :total points","progressText":"Progress :num of :total"},"subContentId":"da2c1652-2dfb-49b2-a859-0003e10ca25c","metadata":{"contentType":"Summary","license":"U","title":"Untitled Summary","authors":[],"changes":[],"extraTitle":"Untitled Summary"}},"displayAt":3}},"override":{"autoplay":false,"loop":false,"showBookmarksmenuOnLoad":false,"showRewind10":false,"preventSkippingMode":"none","deactivateSound":false},"l10n":{"interaction":"Interaction","play":"Play","pause":"Pause","mute":"Mute, currently unmuted","unmute":"Unmute, currently muted","quality":"Video Quality","captions":"Captions","close":"Close","fullscreen":"Fullscreen","exitFullscreen":"Exit Fullscreen","summary":"Open summary dialog","bookmarks":"Bookmarks","endscreen":"Submit screen","defaultAdaptivitySeekLabel":"Continue","continueWithVideo":"Continue with video","more":"More player options","playbackRate":"Playback Rate","rewind10":"Rewind 10 Seconds","navDisabled":"Navigation is disabled","navForwardDisabled":"Navigating forward is disabled","sndDisabled":"Sound is disabled","requiresCompletionWarning":"You need to answer all the questions correctly before continuing.","back":"Back","hours":"Hours","minutes":"Minutes","seconds":"Seconds","currentTime":"Current time:","totalTime":"Total time:","singleInteractionAnnouncement":"Interaction appeared:","multipleInteractionsAnnouncement":"Multiple interactions appeared.","videoPausedAnnouncement":"Video is paused","content":"Content","answered":"@answered answered","endcardTitle":"@answered Question(s) answered","endcardInformation":"You have answered @answered questions, click below to submit your answers.","endcardInformationOnSubmitButtonDisabled":"You have answered @answered questions.","endcardInformationNoAnswers":"You have not answered any questions.","endcardInformationMustHaveAnswer":"You have to answer at least one question before you can submit your answers.","endcardSubmitButton":"Submit Answers","endcardSubmitMessage":"Your answers have been submitted!","endcardTableRowAnswered":"Answered questions","endcardTableRowScore":"Score","endcardAnsweredScore":"answered","endCardTableRowSummaryWithScore":"You got @score out of @total points for the @question that appeared after @minutes minutes and @seconds seconds.","endCardTableRowSummaryWithoutScore":"You have answered the @question that appeared after @minutes minutes and @seconds seconds.","videoProgressBar":"Video progress","howToCreateInteractions":"Play the video to start creating interactions"}}',
      exampleId: "6682f5a999c641004404166a",
      originalJson:
        '{"interactiveVideo":{"video":{"startScreenOptions":{"title":"Interactive Video","hideStartTitle":true,"shortStartDescription":"_VideoDescritpion_"},"textTracks":{"videoTrack":[{"label":"Subtitles","kind":"subtitles","srcLang":"_TrackLang_"}]},"files":[{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/interactiveVideoTemplateVideo.mp4","mime":"video/mp4","copyright":{"license":"U"}}]},"assets":{"interactions":[{"x":47.81280672952277,"y":46.117677416350745,"width":10,"height":10,"duration":{"from":136.563,"to":146.563},"libraryTitle":"Text","action":{"library":"H5P.Text 1.1","params":{"text":"<p>_InteractionLabelText_</p>\\n"},"subContentId":"fb2f5931-4d3e-4a72-81b2-3d1b21f6bbe7","metadata":{"contentType":"Text","license":"U","title":"Untitled Text","authors":[],"changes":[]}},"pause":true,"displayType":"button","buttonOnMobile":false,"visuals":{"backgroundColor":"rgb(255, 255, 255)","boxShadow":true},"goto":{"url":{"protocol":"http://"},"visualize":false,"type":""},"label":"<p>_InteractionLabel_</p>\\n"}],"bookmarks":[{"time":61.780517,"label":"_SectionLabel_"}],"endscreens":[{"time":296.518821,"label":"4:56 Submit screen"}]},"summary":{"task":{"library":"H5P.Summary 1.10","params":{"intro":"<p>Video Summary</p>\\n","summaries":[{"subContentId":"8c23eeba-33a1-4f51-9fa5-8ba38cbe833e","summary":["<p>_Summary_</p>\\n"],"tip":""}],"overallFeedback":[{"from":0,"to":100}],"solvedLabel":"Progress:","scoreLabel":"Wrong answers:","resultLabel":"Your result","labelCorrect":"Correct.","labelIncorrect":"Incorrect! Please try again.","alternativeIncorrectLabel":"Incorrect","labelCorrectAnswers":"Correct answers.","tipButtonLabel":"Show tip","scoreBarLabel":"You got :num out of :total points","progressText":"Progress :num of :total"},"subContentId":"da2c1652-2dfb-49b2-a859-0003e10ca25c","metadata":{"contentType":"Summary","license":"U","title":"Untitled Summary","authors":[],"changes":[],"extraTitle":"Untitled Summary"}},"displayAt":3}},"override":{"autoplay":false,"loop":false,"showBookmarksmenuOnLoad":false,"showRewind10":false,"preventSkippingMode":"none","deactivateSound":false},"l10n":{"interaction":"Interaction","play":"Play","pause":"Pause","mute":"Mute, currently unmuted","unmute":"Unmute, currently muted","quality":"Video Quality","captions":"Captions","close":"Close","fullscreen":"Fullscreen","exitFullscreen":"Exit Fullscreen","summary":"Open summary dialog","bookmarks":"Bookmarks","endscreen":"Submit screen","defaultAdaptivitySeekLabel":"Continue","continueWithVideo":"Continue with video","more":"More player options","playbackRate":"Playback Rate","rewind10":"Rewind 10 Seconds","navDisabled":"Navigation is disabled","navForwardDisabled":"Navigating forward is disabled","sndDisabled":"Sound is disabled","requiresCompletionWarning":"You need to answer all the questions correctly before continuing.","back":"Back","hours":"Hours","minutes":"Minutes","seconds":"Seconds","currentTime":"Current time:","totalTime":"Total time:","singleInteractionAnnouncement":"Interaction appeared:","multipleInteractionsAnnouncement":"Multiple interactions appeared.","videoPausedAnnouncement":"Video is paused","content":"Content","answered":"@answered answered","endcardTitle":"@answered Question(s) answered","endcardInformation":"You have answered @answered questions, click below to submit your answers.","endcardInformationOnSubmitButtonDisabled":"You have answered @answered questions.","endcardInformationNoAnswers":"You have not answered any questions.","endcardInformationMustHaveAnswer":"You have to answer at least one question before you can submit your answers.","endcardSubmitButton":"Submit Answers","endcardSubmitMessage":"Your answers have been submitted!","endcardTableRowAnswered":"Answered questions","endcardTableRowScore":"Score","endcardAnsweredScore":"answered","endCardTableRowSummaryWithScore":"You got @score out of @total points for the @question that appeared after @minutes minutes and @seconds seconds.","endCardTableRowSummaryWithoutScore":"You have answered the @question that appeared after @minutes minutes and @seconds seconds.","videoProgressBar":"Video progress","howToCreateInteractions":"Play the video to start creating interactions"}}',
      category: "X",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Interactive_Video_Template_663d132c02c59a47303f3d8e.html",
      description:
        "An interactive video is a multimedia presentation that allows viewers to engage and interact with the content through clickable areas, decision points, and other interactive elements.",
    },
    {
      labels: [
        {
          "*_Picture_": "image",
        },
        {
          _AltText_: "text",
        },
        {
          _HoverText_: "text",
        },
      ],
      hints: [],
      _id: "666b8c4e7131dd0045d5c299",
      typeName: "Image Slider",
      templateName: "my New Slider Template",
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBTbGlkZXIgVGVtcGxhdGUiLCJpZCI6IjY2MWM0YmYwNGZlODAyYTcyYzZiMWE0MCJ9",
      htmlSeparator: ",",
      repeatedString:
        '{"params":{"image":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","file":{"path":"_Picture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160},"alt":"_AltText_","title":"_HoverText_"},"library":"H5P.Image 1.1","subContentId":"72de0c60-ded0-466e-a8f7-f22190f88f88","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]}}},"library":"H5P.ImageSlide 1.1","subContentId":"0a78847c-50b7-4bf4-b58b-5c100289392b","metadata":{"contentType":"Image Slide","license":"U","title":"_Slide_","authors":[],"changes":[],"extraTitle":"_Slide_"}}',
      repeated2: "",
      repeated3: "",
      abstractParameter: {
        "Slides 2": [
          {
            _Picture_: "image",
            _AltText_: "text",
            _HoverText_: "text ",
          },
        ],
      },
      modifiedJson:
        '{"imageSlides":[{"params":{"image":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","file":{"path":"_Picture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160},"alt":"_AltText_","title":"_HoverText_"},"library":"H5P.Image 1.1","subContentId":"72de0c60-ded0-466e-a8f7-f22190f88f88","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]}}},"library":"H5P.ImageSlide 1.1","subContentId":"0a78847c-50b7-4bf4-b58b-5c100289392b","metadata":{"contentType":"Image Slide","license":"U","title":"_Slide_","authors":[],"changes":[],"extraTitle":"_Slide_"}}],"aspectRatioMode":"auto","aspectRatio":{"aspectWidth":4,"aspectHeight":3},"a11y":{"nextSlide":"Next Image","prevSlide":"Previous Image","gotoSlide":"Go to image %slide"}}',
      exampleId: "6682f1c22c5a800044c6b1d9",
      originalJson:
        '{"imageSlides":[{"params":{"image":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","file":{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/imageSliderTemplateImage.jpeg","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160},"alt":"_AltText_","title":"_HoverText_"},"library":"H5P.Image 1.1","subContentId":"72de0c60-ded0-466e-a8f7-f22190f88f88","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]}}},"library":"H5P.ImageSlide 1.1","subContentId":"0a78847c-50b7-4bf4-b58b-5c100289392b","metadata":{"contentType":"Image Slide","license":"U","title":"_Slide_","authors":[],"changes":[],"extraTitle":"_Slide_"}}],"aspectRatioMode":"auto","aspectRatio":{"aspectWidth":4,"aspectHeight":3},"a11y":{"nextSlide":"Next Image","prevSlide":"Previous Image","gotoSlide":"Go to image %slide"}}',
      category: "X",
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Slider_Template_661c4bee1163f9abdba58098.html",
      description:
        "Image Slider displays a series of images in a rotating or sliding manner.",
    },
    {
      labels: [
        {
          "*_TaskDescription_": "text",
        },
        {
          "*_solutionText_": "text",
        },
        {
          _Picture_: "image",
        },
        {
          _AltText_: "text",
        },
        {
          _HoverText_: "text",
        },
      ],
      hints: [],
      _id: "667aa5ac50784a0044861212",
      typeName: "Guess Answer",
      templateName: "my New Guess Answer Template",
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBHdWVzcyBBbnN3ZXIgVGVtcGxhdGUiLCJpZCI6IjY2Nzk1N2Q2NDZlYTYxYjdiNTE3ZTkyOCJ9",
      htmlSeparator: "",
      repeatedString: "",
      repeated2: "",
      repeated3: "",
      abstractParameter: {
        _TaskDescription_: "text",
        _SolutionText_: "text",
        _Picture_: "image",
        _AltText_: "text",
        _HoverText_: "text",
      },
      modifiedJson:
        '{"media":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","alt":"_AltText_","title":"_HoverText_","file":{"path":"_Picture_","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}},"library":"H5P.Image 1.1","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]},"subContentId":"bb407f29-b79d-4e49-9935-47c12ffd894a"},"solutionLabel":"Click to see the answer","taskDescription":"<p>_TaskDescription_</p>\\n","solutionText":"_SolutionText_"}',
      exampleId: "6683c3442acb4a0044ed4d7e",
      category: "X",
      originalJson:
        '{"media":{"params":{"decorative":false,"contentName":"Image","expandImage":"Expand Image","minimizeImage":"Minimize Image","alt":"_AltText_","title":"_HoverText_","file":{"path":"https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/templateImages/templateImg.jpeg","mime":"image/jpeg","copyright":{"license":"U"},"width":3840,"height":2160}},"library":"H5P.Image 1.1","metadata":{"contentType":"Image","license":"U","title":"Untitled Image","authors":[],"changes":[]},"subContentId":"bb407f29-b79d-4e49-9935-47c12ffd894a"},"solutionLabel":"Click to see the answer.","taskDescription":"<p>_TaskDescription_</p>\\n","solutionText":"_SolutionText_"}',
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Guess_Answer_Template_667957d42568c97801623c69.html",
      description:
        " It is an interactive task based on an image. The learner must guess the answer and press a button below the image  to check whether the answer was correct.",
    },
    {
      labels: [
        {
          "*_GraphMode_": "DropList: Bar-Chart, PieChart",
        },
        {
          "*_DataElementName_": "text",
        },
        {
          "*_Value_": "number",
        },
        {
          _Color_: "color",
        },
        {
          _FontColor_: "color",
        },
      ],
      hints: [],
      _id: "667c7203a809a3004486cd68",
      typeName: "Chart",
      templateName: "my New Chart Template",
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBDaGFydCBUZW1wbGF0ZSIsImlkIjoiNjY1ZTEyYjJhMjA4OTlmYmEwY2I3YzI5In0=",
      htmlSeparator: ",",
      repeatedString:
        '{"value":_Value_,"color":"_Color_","fontColor":"_FontColor_","text":"_DataElementName_"}',
      repeated2: "",
      repeated3: "",
      abstractParameter: {
        _GraphMode_: "text",
        Data: [
          {
            _DataElementName_: "text",
            _Value_: "number",
            _Color_: "color",
            _FontColor_: "color",
          },
        ],
      },
      modifiedJson:
        '{"graphMode":"_GraphMode_","listOfTypes":[{"value":_Value_,"color":"_Color_","fontColor":"_FontColor_","text":"_DataElementName_"}],"figureDefinition":"Chart"}',
      exampleId: "668307812c4fe70044713871",
      category: "X",
      originalJson:
        '{"graphMode":"pieChart","listOfTypes":[{"value":1,"color":"#000","fontColor":"#fff","text":"_DataElementName_"}],"figureDefinition":"Chart"}',
      templateUrl:
        "https://s3.eu-west-1.amazonaws.com/lom-dev.eduedges.com/templates/my_New_Char_Template_665e12b2aa4299a6943d73cc.html",
      description:
        "Charts and graphs are powerful tools for visually representing data in an easy-to-understand format.",
    },
    {
      labels: [
        {
          "*_Question_": "text",
        },
        {
          "#_Correct_": "Bool",
        },
      ],
      hints: [],
      _id: "66815c820129030043ec7515",
      typeName: "TrueFalse",
      templateName: "my New T/F Template",
      templateId:
        "eyJ0aXRsZSI6Im15IE5ldyBUcnVlRmFsc2UgVGVtcGxhdGUiLCJpZCI6IjY2MWQ3N2E1NDljZWI1NWEwMzhjOTNmNSJ9",
      htmlSeparator: "",
      repeatedString: "",
      repeated2: "",
      repeated3: "",
      abstractParameter: {
        _Question_: "text",
        _Correct_: "Bool",
      },
      modifiedJson:
        '{"media":{"disableImageZooming":false},"correct":"_Correct_","behaviour":{"enableRetry":true,"enableSolutionsButton":true,"enableCheckButton":true,"confirmCheckDialog":false,"confirmRetryDialog":false,"autoCheck":false,"feedbackOnCorrect":"Perfect","feedbackOnWrong":"Oooooops....Try again"},"l10n":{"trueText":"True","falseText":"False","score":"You got @score of @total points","checkAnswer":"Check","submitAnswer":"Submit","showSolutionButton":"Show solution","tryAgain":"Retry","wrongAnswerMessage":"Wrong answer","correctAnswerMessage":"Correct answer","scoreBarLabel":"You got :num out of :total points","a11yCheck":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","a11yShowSolution":"Show the solution. The task will be marked with its correct solution.","a11yRetry":"Retry the task. Reset all responses and start the task over again."}',
      exampleId: "",
      category: "Q",
      originalJson:
        '{"media":{"disableImageZooming":false},"correct":"true","behaviour":{"enableRetry":true,"enableSolutionsButton":true,"enableCheckButton":true,"confirmCheckDialog":false,"confirmRetryDialog":false,"autoCheck":false,"feedbackOnCorrect":"Perfect","feedbackOnWrong":"Oooooops....Try again"},"l10n":{"trueText":"True","falseText":"False","score":"You got @score of @total points","checkAnswer":"Check","submitAnswer":"Submit","showSolutionButton":"Show solution","tryAgain":"Retry","wrongAnswerMessage":"Wrong answer","correctAnswerMessage":"Correct answer","scoreBarLabel":"You got :num out of :total points","a11yCheck":"Check the answers. The responses will be marked as correct, incorrect, or unanswered.","a11yShowSolution":"Show the solution. The task will be marked with its correct solution.","a11yRetry":"Retry the task. Reset all responses and start the task over again."}',
    },
    {
      labels: [
        {
          paragraph: "text",
        },
        {
          "Text MCQ": "Text MCQ",
        },
        {
          "Mark The Words": "Mark The Words",
        },
        {
          "Text Drag Words": "Text Drag Words",
        },
        {
          "Image Juxtaposition": "Image Juxtaposition",
        },
        {
          "Image MCQ": "Image MCQ",
        },
        {
          "Fill The Blanks": "Fill The Blanks",
        },
        {
          Dictation: "Dictation",
        },
        {
          "Sort Paragraphs": "Sort Paragraphs",
        },
        {
          "Image Blinder (Agamotto)": "Image Blinder (Agamotto)",
        },
        {
          Accordion: "Accordion",
        },
        {
          "Image Pairing": "Image Pairing",
        },
        {
          "Image Multiple Hotspot Question": "Image Multiple Hotspot Question",
        },
        {
          Essay: "Essay",
        },
        {
          "Sort Images": "Sort Images",
        },
        {
          "Dialog Cards": "Dialog Cards",
        },
        {
          "Flash Cards": "Flash Cards",
        },
        {
          "Hotspot Image": "Hotspot Image",
        },
        {
          "Interactive Video": "Interactive Video",
        },
        {
          "Image Slider": "Image Slider",
        },
        {
          "Guess Answer": "Guess Answer",
        },
        {
          Chart: "Chart",
        },
        {
          TrueFalse: "TrueFalse",
        },
      ],
      hints: [],
      _id: "669ffe72df446700455da5fe",
      typeName: "SI",
      abstractParameter: {
        slides: [
          {
            paragraph: "text",
            object: "object",
          },
        ],
      },
    },
  ],
};
