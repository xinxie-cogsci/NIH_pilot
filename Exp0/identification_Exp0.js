/*
 * Author: Xin Xie
 *
 *    Copyright 2021 Xin Xie
 *    This program is free software: you can redistribute it and/or modify
 *    it under the terms of the GNU Lesser General Public License version 2.1 as
 *    published by the Free Software Foundation.
 *
 *    This program is distributed in the hope that it will be useful,
 *    but WITHOUT ANY WARRANTY; without even the implied warranty of
 *    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *    GNU Lesser General Public License for more details.
 *
 *    You should have received a copy of the GNU Lesser General Public License
 *    along with this program.
 *    If not, see <http://www.gnu.org/licenses/old-licenses/lgpl-2.1.html>.
 */

var _curBlock;

var vidSuffix, audSuffix;

var respDelim = ';';
// response categories

// global variable for computing the size for each increment of the progress bar (see progressBar.js)
var pbIncrementSize;

// Experiment object to control everything
var e;
var isTest = false;

$(document).ready(function() {

    // create an experiment object with the necessary RSRB metadata
    e = new Experiment(
        {
            rsrbProtocolNumber: 'RSRB00045955',
            consentForm: 'https://www.hlp.rochester.edu/consent/RSRB45955_Consent_2021-02-10.pdf',
            survey: 'surveys/priming_survey.html' //Post-experiment survey that will show up at the very end of the experiment
        }
    );
    e.init();

    ///////////////////////////////////////////////////////////
    // parse relevant URL parameters
    e.sandboxmode = checkSandbox(e.urlparams);
    e.previewMode = checkPreview(e.urlparams);
//    e.previewMode = true;
    e.debugMode = checkDebug(e.urlparams);

    // e.urlparams is a dictionary (key-value mapping) of all the url params.
    // you can use these to control any aspect of your experiment you wish on a HIT-by-HIT
    // basis using the .question and .input files (see hits/vroomen-replication.* for examples)

    ////////////////////////////////////////////////////////////
    // Create and add blocks of experiment.

    ////////////////////////////////////////////////////////////////////////
    // Instructions

    var condition = e.urlparams['condition'];
    var TrL = e.urlparams['TrL'];    //which training list A or B
    var TeL = e.urlparams['TeL']; //which test list for test block 1 & 2: 1,2,3,4,5,6
    var isTest = e.urlparams['test']; // Should tell us which probes are being use for test and training

    //start of instructions section
    var instructions = new InstructionsSubsectionsBlock(
            {
                logoImg: 'img/logo.png',
                title: 'Listen, look and decide',
                mainInstructions: ['Thanks for your interest in our study!  This HIT is a psychology experiment about how people understand speech. You will listen to speech sounds and you will also see visual objects or text. You will have to make a decision about what you hear and/or what you see.',
                                   'Details will be provided once the experiment begins.',
                                   'Please read through each of the following items that will inform you about the study and its requirements. You can click the headings below to expand or close each section.',
                                   '<span style="font-weight:bold;">Do not take this experiment more than once! </span>'],
                buttonInstructions: 'I confirm that I meet the eligibility and computer requirements, that I have read and understood the instructions and the consent form, and that I want to start the experiment.',
                beginMessage: 'Begin the experiment',
                exptInstructions: true, // true means that this instruction block is the Experiment Instruction at the beginning of the experiment, not instruction for a section
                subsections: [
                                {
                                    title: 'Experiment length',
                                    content: 'This experiment will take about 20 to 30 minutes and you will be paid $3.00.',
                                },
                                {
                                    title: 'Eligibility requirements',
                                    content: ['You must be between the<span style="font-weight:bold;"> age of 18 to 45</span>. You must be a native speaker of American English to participate. This means that you must have grown up and <span style="font-weight:bold;">spent at least the first 7 years of your life in the United States speaking English primarily.</span>','You must have <span style="font-weight:bold;">normal hearing</span> and normal or corrected to normal vision. You must do this experiment by yourself.  It is of critical importance that you are in a <span style="font-weight:bold;">quiet room free of any of distractions and wear headphones.<span style="font-weight:bold;">', 'Please maximize the browser window to eliminate distractions. This experiment requires that your browser support javascript.',
                                              ],
                                    checkboxText: 'I have read and understand the requirements.'
                                },
                                {
                                    title: 'Sound check',
                                    content: ['This section will help set your volume to a comfortable listening level. It is important that you <span style="font-weight:bold;">do not</span> change your volume during the actual experiment. Press each green button to play a word, and enter it in the space provided in all lowercase letters.',
                                              function() {
                                                  var soundcheck = new SoundcheckBlock(
                                                      {
                                                          items: [
                                                              {
                                                                  filename: 'stimuli_soundcheck/painting',
                                                                  answer: 'painting'
                                                              },
                                                              {
                                                                  filename: 'stimuli_soundcheck/matchbox',
                                                                  answer: 'matchbox'
                                                              }
                                                          ],
                                                          instructions: '',
                                                      }
                                                  );
                                                  return(soundcheck.init());
                                              }]
                                },
                                {
                                    title: 'Informed consent',
                                    content: e.consentFormDiv,
                                    checkboxText: 'I consent to participating in this experiment'
                                },
                                {
                                    title: 'Further (optional) information',
                                    content: ['Sometimes it can happen that technical difficulties cause experimental scripts to freeze so that you will not be able to submit a HIT. We are trying our best to avoid these problems. Should they nevertheless occur, we urge you to <a href="mailto:hlplab@gmail.com">contact us</a>, and include the HIT ID number and your worker ID.',
                                              'If you are interested in hearing how the experiments you are participating in help us to understand the human brain, feel free to subscribe to our <a href="http://hlplab.wordpress.com/">lab blog</a> where we announce new findings. Note that typically about one year passes before an experiment is published.'],
                                    finallyInfo: true
                                }
                            ]
            }); 
    //end of instructions section
            
    e.addBlock({block: instructions,
                onPreview: true,
                showInTest: false //showInTest: when urlparam for mode=test, don't add the block
    });  // onPreview = true for blocks that can be viewed BEFORE the worker accepts a HIT. To get an idea of what this means, try to go through the HIT without accepting it and see how far you get


    if (e.previewMode) {
        e.nextBlock();
    }
    
    /*Rest of the experiment here*/
    else {
        //INSTURCTIONS FOR TRAINING BLOCK
        var instructions_0 = new InstructionsSubsectionsBlock(
            {
                instrImg: 'img/block_procedure.png',
                instrStyle: 'logo2',
                title: 'Listen and decide!',
                mainInstructions: ['<span style="font-weight:bold;">Because you will be asked to make judgments <u>as accurately and as quickly as possible</u>, it is important that you do this experiment in a quiet room with no sources of distraction in the background. Please turn off your ringtones and other notifications.</span>',
                                   'This experiment has 5 short blocks. The blocks 1, 3, 5 are short and each of them takes about 2-3 minutes. In these blocks, you will be asked to judge <font color="blue">whether a word you heard ended with the sound “d” (as in <em>be<u>d</u></em>) or “t” (as in <em>be<u>t</em></u>)</font>.', 
                                   'The blocks 2 and 4 are slightly longer, each lasting for about about 5-10 mins. In these blocks, you will be asked to judge <font color="orange">whether the word you heard was a real word of English (e.g., <em>celery</em>) or not (e.g., <em>effering</em>).</font>',
                                   'The image below presents a schematic diagram of the procedure. <br>We will start with some practice questions.',
                  ],
                buttonInstructions: 'Start the practice trials',
                beginMessage: 'Begin the practice',
                exptInstructions: false,

            });
            
        e.addBlock({block: instructions_0,
                    onPreview: true,
                    showInTest: true //showInTest: when urlparam for mode=test, don't add the block
        });  // onPreview = true for blocks that can be viewed BEFORE the worker accepts a HIT. To get an idea of what this means, try to go through the HIT without accepting it and see how far you get


        var instructions_1 = new InstructionsSubsectionsBlock(
            {
                instrImg: 'img/ID_task.png',
                instrStyle: 'logo2',
                title: '<span style="font-weight:bold;"><font color="blue">D or T?</font></span>',
                mainInstructions: [
                                   'In this practice, you will hear words ending in /d/ or /t/. Choose the sound you hear by pressing the corresponding button.', 
                  ],
                buttonInstructions: 'Start the practice trials',
                beginMessage: 'Begin the practice',
                exptInstructions: false,

            });
            
        e.addBlock({block: instructions_1,
                    onPreview: true,
                    showInTest: true //showInTest: when urlparam for mode=test, don't add the block
        });  // onPreview = true for blocks that can be viewed BEFORE the worker accepts a HIT. To get an idea of what this means, try to go through the HIT without accepting it and see how far you get

       //EXAMPLE BLOCK 1: Identification task
       var sampleStimID = new ExtendedStimuliFileList(
            {
                prefix: "stimuli/Test/Eng_01_M/",
                mediaType: 'audio',
                filenames: ['bud','but', 'feed', 'feet'], //sentence is not in usable stimulus list; speaker is not either
                probes: [''],
                correctKeys: ['Yes','No']
            }
        );
        var sampleBlockID = new IdentificationBlock({stimuli: sampleStimID,
                     blockRandomizationMethod: "shuffle",
                     trialInstructions: "Does the word end in /d/ or /t/?",
                     reps: 1,
                     respKeys: {'D': 'd', 'T': 't'}, 
                     categories: ['d', 't'], 
                     fixationTime: 500,
                     ITI:1500, // this interval is used to present feedback if any
                     respTimeOut: 10000,
                     mediaType: 'audio',
                     namespace: 'test1'
                     }); 
                                     
         e.addBlock({
                  block: sampleBlockID,
                  instructions:'<span style="font-weight:bold;">Please respond as quickly as possible.</span> <br><br><font color="red">It is important that you keep your volume at the same level throughout the experiment.</font>',
                  onPreview: false,
         });
         
         var instructions_2 = new InstructionsSubsectionsBlock(
            {
                instrImg: 'img/LD_task.png',
                instrStyle: 'logo2',
                title: '<span style="font-weight:bold;"><font color="orange">Word or not?</font></span>',
                mainInstructions: [
                                   'Now we will do a practice for the second task. In this part, you will hear real words and nonsense words.',
                                   'Your task is to decide whether what you hear is a word of English or not. Each sound will only be played once.',
                          		   "<p>Press the corresponding key depending on whether <span style='font-weight:bold;'>you hear a real word of English or not. </span></p>", 
                  ],
                buttonInstructions: 'Start the practice trials',
                beginMessage: 'Begin the practice',
                exptInstructions: false,

            });
            
        e.addBlock({block: instructions_2,
                    onPreview: true,
                    showInTest: true //showInTest: when urlparam for mode=test, don't add the block
        });  // onPreview = true for blocks that can be viewed BEFORE the worker accepts a HIT. To get an idea of what this means, try to go through the HIT without accepting it and see how far you get

       
       //EXAMPLE BLOCK 2: Lexical decision task
       var sampleStimLD = new ExtendedStimuliFileList(
            {
                prefix: "stimuli/LD/Eng_07_M/",
                mediaType: 'audio',
                filenames: ['animal','zeneva'], //sentence is not in usable stimulus list; speaker is not either
                probes: [''],
                correctKeys: ['Yes','No']
            }
        );
        var sampleBlockLD = new PrimingBlock({stimuli: sampleStimLD,
                             blockRandomizationMethod: "dont_randomize",
                             trialInstructions: "Do you hear a real English word?",
                             reps: 1,
                             respKeys: {'A': 'Yes', 'L': 'No'}, //{'A': 'Yes', 'L': 'No'},
                             categories: ['Yes', 'No'], // ['Yes', 'No']
                             feedback: true,
                             fixationTime: 500,
                             ITI:2000, // this interval is used to present feedback if any
                             respTimeOut: 2000,
                             mediaType: 'audio',
                             namespace: 'sample'});                        
         e.addBlock({
                  block: sampleBlockLD,
                  instructions:'During this practice session, you will get feedback regarding your accuracy and the time it takes you to respond. <span style="font-weight:bold;">Please respond as quickly as possible.</span> <br><br><font color="red">It is important that you keep your volume at the same level throughout the experiment.</font>',
                  onPreview: false,
         });
        
        //REST OF EXP
        var testPrefix;
        var trainingPrefix;
        var stimListFile;
        if (condition === "testRun") {
            training1Prefix = "stimuli/LD/Mandarin_speaker5/";
            training2Prefix = "stimuli/LD/Mandarin_speaker5/";
           // practicePrefix = "stimuli/Test/Mandarin_speaker5/";
            test0Prefix = "stimuli/Test/Mandarin_speaker5/";
            test1Prefix = "stimuli/Test/Mandarin_speaker5/";
            test2Prefix = "stimuli/Test/Mandarin_speaker5/";
            training1List = "lists/Training1_List_"+condition+"_"+TrL+".txt";
            training2List = "lists/Training2_List_"+condition+"_"+TrL+".txt";
           // practiceList = "lists/Test/Test0_List"+TeL+".txt";
            test0List = "lists/Test/Testrun/Test0_List"+TeL+".txt";
            test1List = "lists/Test/Testrun/Test1_List"+TeL+".txt";
            test2List = "lists/Test/Testrun/Test2_List"+TeL+".txt";
        }
        if (condition === "experimental") {
            training1Prefix = "stimuli/LD/Mandarin_speaker5/";
            training2Prefix = "stimuli/LD/Mandarin_speaker5/";
            //practicePrefix = "stimuli/Test/Mandarin_speaker5/";
            test0Prefix = "stimuli/Test/Mandarin_speaker5/";
            test1Prefix = "stimuli/Test/Mandarin_speaker5/";
            test2Prefix = "stimuli/Test/Mandarin_speaker5/";
            training1List = "lists/Training1_List_"+condition+"_"+TrL+".txt";
            training2List = "lists/Training2_List_"+condition+"_"+TrL+".txt";
            //practiceList = "lists/Test0.txt";
            test0List = "lists/Test/Test0_List"+TeL+".txt";
            test1List = "lists/Test/Test1_List"+TeL+".txt";
            test2List = "lists/Test/Test2_List"+TeL+".txt";
        }
        if (condition === "control") {
           	training1Prefix = "stimuli/LD/Mandarin_speaker5/";
            training2Prefix = "stimuli/LD/Mandarin_speaker5/";
            //practicePrefix = "stimuli/Test/Mandarin_speaker5/";
            test0Prefix = "stimuli/Test/Mandarin_speaker5/";
            test1Prefix = "stimuli/Test/Mandarin_speaker5/";
            test2Prefix = "stimuli/Test/Mandarin_speaker5/";
            training1List = "lists/Training1_List_"+condition+"_"+TrL+".txt";
            training2List = "lists/Training2_List_"+condition+"_"+TrL+".txt";
           // practiceList = "lists/Test0.txt";
            test0List = "lists/Test/Test0_List"+TeL+".txt";
            test1List = "lists/Test/Test1_List"+TeL+".txt";
            test2List = "lists/Test/Test2_List"+TeL+".txt";
        }
        
        
        //PRE-TEST BLOCK
        Papa.parse(test0List, {
            download: true,
            header: true,
            delimiter: '|',
            skipEmptyLines: true,
            complete: function(results) {
                console.log(test0List);
                var test0Stim = new ExtendedStimuliFileList({
                        prefix: test0Prefix,
                        mediaType: 'audio',
                        filenames: getFromPapa(results, 'Filename'),
                        probes: getFromPapa(results, 'Target'),
                        correctKeys: getFromPapa(results,'CorrectAnswer')
                });
                var test0Block = new IdentificationBlock({stimuli: test0Stim,
                         blockRandomizationMethod: "shuffle",
                         trialInstructions: "Does the word end in /d/ or /t/?",
                         reps: 1,
                         respKeys: {'D': 'd', 'T': 't'}, 
                         categories: ['d', 't'], 
                         fixationTime: 500,
                         ITI:1500, // this interval is used to present feedback if any
                         respTimeOut: 10000,
                         mediaType: 'audio',
                         namespace: 'test0'
                });                                
                 e.addBlock({
                          block: test0Block,
                          instructions:["<p>Great! You are done with the practice. Now the real experiment begins. You will hear a different speaker, but the tasks remain the same. </p>",
                          "<p>In Block 1, you will complete the <font color='blue'>'D or T'</font> task.</p>",
                          "<p><span style='font-weight:bold;'>Respond as quickly as possible without sacrificing accuracy. We encourage you to keep your fingers on the two keys ('D' and 'T') throughout this part.</span></p>", 
                          "<p><font color='red'>Remember to keep your volume at the same level it was previously. </font></p>",
                          ],
                          onPreview: false,
                  });

          //END OF PRACTICE FOR TEST BLOCK
         
        
        //TRAINING BLOCK 1
        Papa.parse(training1List, {
            download: true,
            header: true,
            delimiter: '|',
            skipEmptyLines: true,
            complete: function(results) {
                console.log(training1List);
                var training1Stim = new ExtendedStimuliFileList({
                        prefix: training1Prefix,
                        mediaType: 'audio',
                        filenames: getFromPapa(results, 'Filename'),
                        probes: getFromPapa(results, 'Target'),
                        correctKeys: getFromPapa(results,'CorrectAnswer')
                });
               var training1Block = new PrimingBlock({stimuli: training1Stim,
                         blockRandomizationMethod: "dont_randomize",
                         trialInstructions: "Do you hear a real word?",
                         reps: 1,
                         respKeys: {'A': 'Yes', 'L': 'No'}, //{71: 'B', 72: 'D'},
                         categories: ['Yes', 'No'], // ['B', 'D']
                         mediaType: 'audio',
                         fixationTime: 500,
                         ITI:1500, 
                         respTimeOut: 2000,
                         namespace: 'training1'}); 
                e.addBlock({
                          block: training1Block,
                          instructions:["<p>You have completed Block 1!</p>",
                          				"<p>In the next block, you will complete the <font color='orange'>'Word or not'</font> task. Your task is to decide whether what you hear is a word of English or not. Each sound will only be played once. </p>",
                          				"<p>Press the corresponding key depending on whether <span style='font-weight:bold;'>you hear a real word of English or not ('A' for Yes, 'L' for No). </span><p>",
                          				"<p><span style='font-weight:bold;'>Respond as quickly as possible without sacrificing accuracy. We encourage you to keep your fingers on the two keys ('A' and 'L') throughout this part.</span></p>", 
                                        "<p>During this part, you won't be shown your reaction time, but we will record it. This part takes you about 10 mins to finish. </p>", 
                                        "<font color='red'>Remember to keep your volume at the same level it was previously. </font>",
                          ],
                          onPreview: false,
                 });

            //END OF TRAINING BLOCK 1
 
     
         //TEST BLOCK 1
                    
         Papa.parse(test1List, {
            download: true,
            header: true,
            delimiter: '|',
            skipEmptyLines: true,
            complete: function(results) {
                var test1Stim = new ExtendedStimuliFileList(
                    {
                        prefix: test1Prefix,
                        mediaType: 'audio',
                        filenames: getFromPapa(results, 'Filename'),
                        probes: getFromPapa(results, 'Target'),
                        correctKeys: getFromPapa(results,'CorrectAnswer')
                    });
                var test1Block = new IdentificationBlock({stimuli: test1Stim,
                     blockRandomizationMethod: "shuffle",
                     trialInstructions: "Does the word end in /d/ or /t/?",
                     reps: 1,
                     respKeys: {'D': 'd', 'T': 't'}, 
                     categories: ['d', 't'], 
                     fixationTime: 500,
                     ITI:1500, // this interval is used to present feedback if any
                     respTimeOut: 10000,
                     mediaType: 'audio',
                     namespace: 'test1'
                     }); 
                                              
                 e.addBlock({
                          block: test1Block,
                          instructions:["<p>You have completed Block 2! The next block is short and you will again complete the <font color='blue'>'D or T' </font>task.</p>",
                          "<p><span style='font-weight:bold;'>Respond as quickly as possible without sacrificing accuracy. We encourage you to keep your fingers on the two keys ('D' and 'T') throughout this part.</span></p>",
                          "<font color='red'>Remember to keep your volume at the same level it was previously. "
                          ],
                          onPreview: false,
                  });
                  
            //TRAINING BLOCK 2      
        Papa.parse(training2List, {
            download: true,
            header: true,
            delimiter: '|',
            skipEmptyLines: true,
            complete: function(results) {
                console.log(training2List);
                var training2Stim = new ExtendedStimuliFileList({
                        prefix: training1Prefix,
                        mediaType: 'audio',
                        filenames: getFromPapa(results, 'Filename'),
                        probes: getFromPapa(results, 'Target'),
                        correctKeys: getFromPapa(results,'CorrectAnswer')
                });
               var training2Block = new PrimingBlock({stimuli: training2Stim,
                         blockRandomizationMethod: "dont_randomize",
                         trialInstructions: "Do you hear a real word?",
                         reps: 1,
                         respKeys: {'A': 'Yes', 'L': 'No'}, //{71: 'B', 72: 'D'},
                         categories: ['Yes', 'No'], // ['B', 'D']
                         mediaType: 'audio',
                         fixationTime: 500,
                         ITI:1500, 
                         respTimeOut: 2000,
                         namespace: 'training2'}); 
                e.addBlock({
                          block: training2Block,
                          instructions:["<p>You have completed Block 3! Now let's do another round of <font color='blue'>'Word or not'</font> judgment. </p>", 
                          				"<p>Press the corresponding key depending on whether <span style='font-weight:bold;'>you hear a real word of English or not ('A' for Yes, 'L' for No). </span><p>",
                          				"<p><span style='font-weight:bold;'>Respond as quickly as possible without sacrificing accuracy. We encourage you to keep your fingers on the two keys ('A' and 'L') throughout this part.</span></p>", 
                                        "<p>During this part, you won't be shown your reaction time, but we will record it. This part takes you about 10 mins to finish. </p>", 
                                        "<font color='red'>Remember to keep your volume at the same level it was previously. </font>",
                          ],
                          onPreview: false,
                 });

            //END OF TRAINING BLOCK 2     
            
                  
            //TEST BLOCK 2   
             Papa.parse(test2List, {
                download: true,
                header: true,
                delimiter: '|',
                skipEmptyLines: true,
                complete: function(results) {
                    var test2Stim = new ExtendedStimuliFileList(
                        {
                            prefix: test2Prefix,
                            mediaType: 'audio',
                            filenames: getFromPapa(results, 'Filename'),
                            probes: getFromPapa(results, 'Target'),
                            correctKeys: getFromPapa(results,'CorrectAnswer')
                        });
                    var test2Block = new IdentificationBlock({stimuli: test2Stim,
                         blockRandomizationMethod: "shuffle",
                         trialInstructions: "Does the word end in /d/ or /t/?",
                         reps: 1,
                         respKeys: {'D': 'd', 'T': 't'}, 
                         categories: ['d', 't'], 
                         fixationTime: 500,
                         ITI:1500, // this interval is used to present feedback if any
                         respTimeOut: 10000,
                         mediaType: 'audio',
                         namespace: 'test2'}); 
                                              
                     e.addBlock({
                              block: test2Block,
                              instructions:["<p>You have completed Block 4! The next will be the last block of the experiment.",
                              				"<p>You will again complete the <font color='blue'>'D or T'</font> task.</p>",
                              				"<p><span style='font-weight:bold;'>Respond as quickly as possible without sacrificing accuracy. We encourage you to keep your fingers on the two keys ('D' and 'T') throughout this part.</span></p>",
                              				"<font color='red'>Remember to keep your volume at the same level it was previously. "
                                            ],
                              onPreview: false,
                      });
                  
                $("#continue").hide();
                e.nextBlock();     


					 }
					}); 
                   }
                }); 
             }
            }); 
            }
        }); 
       }
    });                 

   }
   /*End of Rest of the experiment here*/
});  
