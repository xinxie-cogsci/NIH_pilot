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
            consentForm: 'https://www.hlp.rochester.edu/mturk/xxie/NIH_pilot/consent/Prolific_Consent_1013_2021.pdf',
            survey: '../surveys/priming_survey_shorts.html' //Post-experiment survey that will show up at the very end of the experiment
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
    var condition = 'testRun';
    var TrL = 'A';    //which training list A or B
    var TeL = '0'; //which test list for test block 1 & 2: 1,2,3,4,5,6
   // var isTest = e.urlparams['test']; // Should tell us which probes are being use for test and training

    //start of instructions section
    var instructions = new InstructionsSubsectionsBlock(
            {
                logoImg: '../img/logo.png',
                title: 'Listen and decide',
                mainInstructions: ['Thanks for your interest in our study! We are trying to understand how people comprehend speech. In this study, you will listen to speech sounds and make a decision about what you hear. Your response will provide critical information that helps us to advance speech technology.',
                				   'This experiment will take about 20 to 30 minutes and you will be paid $3.00.',
                                   '<font color="red">Please click each of the following headings in sequence and read through the instructions about the study and its requirements. You can click the headings below to expand or close each section. You need to complete all of the sections before continuing. </font>',
                                   ],
                                                                      
                buttonInstructions: 'I confirm that I meet the eligibility and computer requirements, that I have read and understood the instructions and the consent form, and that I want to start the experiment.',
                beginMessage: 'Begin the experiment',
                exptInstructions: true, // true means that this instruction block is the Experiment Instruction at the beginning of the experiment, not instruction for a section
                subsections: [

                                {
                                    title: 'Technical difficulties',
                                    content: ['Please maximize the browser window to eliminate distractions. This experiment requires that your browser support javascript.',
                                    		  //'Sometimes it can happen that technical difficulties cause experimental scripts to freeze so that you will not be able to submit your session. We are trying our best to avoid these problems. Should they nevertheless occur, we urge you to <a href="mailto:hlplab@gmail.com">contact us</a>, and include the HIT ID number and your worker ID.',
                                             // 'If you are interested in hearing how the experiments you are participating in help us to understand the human brain, feel free to subscribe to our <a href="http://hlplab.wordpress.com/">lab blog</a> where we announce new findings. Note that typically about one year passes before an experiment is published.'
                                             ],
                                    finallyInfo: false
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
                instrImg: '../img/block_procedure.png',
                instrStyle: 'logo2',
                title: 'Listen and decide!',
                mainInstructions: [
                                   'This experiment has 5 short blocks. The blocks 1, 3, 5 are short and each of them takes about 2-3 minutes. In these blocks, you will be asked to judge <font color="blue">whether a word you heard ended with the sound “d” (as in <em>be<u>d</u></em>) or “t” (as in <em>be<u>t</em></u>)</font>.', 
                                   'The blocks 2 and 4 are slightly longer, each lasting for about about 3-5 mins. In these blocks, you will be asked to judge <font color="orange">whether the word you heard was a real word of English (e.g., <em>celery</em>) or not (e.g., <em>effering</em>).</font>',
                                   '<span style="font-weight:bold;">In both tasks, you can respond as soon as the audio play finishes. Please respond <u>as accurately and as quickly as possible</u>. Your performance will be tracked throughout the experiment. You may gain additional reward if your performance is good enough.',
                                   'We will start with some practice questions.',
                  ],
                buttonInstructions: 'Start the practice trials',
                beginMessage: 'Click when ready',
                exptInstructions: false,

            });
            
        e.addBlock({block: instructions_0,
                    onPreview: true,
                    showInTest: true //showInTest: when urlparam for mode=test, don't add the block
        });  // onPreview = true for blocks that can be viewed BEFORE the worker accepts a HIT. To get an idea of what this means, try to go through the HIT without accepting it and see how far you get


        //REST OF EXP
        var testPrefix;
        var trainingPrefix;
        var stimListFile;
        if (condition === "testRun") {
            training1Prefix = "../stimuli/LD/Mandarin_speaker5/";
            training2Prefix = "../stimuli/LD/Mandarin_speaker5/";
           // practicePrefix = "stimuli/Test/Mandarin_speaker5/";
            test0Prefix = "../stimuli/Test/Mandarin_speaker5/";
            test1Prefix = "../stimuli/Test/Mandarin_speaker5/";
            test2Prefix = "../stimuli/Test/Mandarin_speaker5/";
            training1List = "../lists/Training/Testrun/Training1_List_"+condition+"_"+TrL+".txt";
            training2List = "../lists/Training/Testrun/Training2_List_"+condition+"_"+TrL+".txt";
           // practiceList = "../lists/Test/Test0_List"+TeL+".txt";
            test0List = "../lists/Test/Testrun/Test0_List"+TeL+".txt";
            test1List = "../lists/Test/Testrun/Test1_List"+TeL+".txt";
            test2List = "../lists/Test/Testrun/Test2_List"+TeL+".txt";
        }
        if (condition === "experimental") {
            training1Prefix = "../stimuli/LD/Mandarin_speaker5/";
            training2Prefix = "../stimuli/LD/Mandarin_speaker5/";
            //practicePrefix = "../stimuli/Test/Mandarin_speaker5/";
            test0Prefix = "../stimuli/Test/Mandarin_speaker5/";
            test1Prefix = "../stimuli/Test/Mandarin_speaker5/";
            test2Prefix = "../stimuli/Test/Mandarin_speaker5/";
            training1List = "../lists/Training/Training1_List_"+condition+"_"+TrL+".txt";
            training2List = "../lists/Training/Training2_List_"+condition+"_"+TrL+".txt";
            //practiceList = "../lists/Test0.txt";
            test0List = "../lists/Test/Test0_List"+TeL+".txt";
            test1List = "../lists/Test/Test1_List"+TeL+".txt";
            test2List = "../lists/Test/Test2_List"+TeL+".txt";
        }
        if (condition === "control") {
           	training1Prefix = "../stimuli/LD/Mandarin_speaker5/";
            training2Prefix = "../stimuli/LD/Mandarin_speaker5/";
            //practicePrefix = "../stimuli/Test/Mandarin_speaker5/";
            test0Prefix = "../stimuli/Test/Mandarin_speaker5/";
            test1Prefix = "../stimuli/Test/Mandarin_speaker5/";
            test2Prefix = "../stimuli/Test/Mandarin_speaker5/";
            training1List = "../lists/Training/Training1_List_"+condition+"_"+TrL+".txt";
            training2List = "../lists/Training/Training2_List_"+condition+"_"+TrL+".txt";
           // practiceList = "../lists/Test0.txt";
            test0List = "../lists/Test/Test0_List"+TeL+".txt";
            test1List = "../lists/Test/Test1_List"+TeL+".txt";
            test2List = "../lists/Test/Test2_List"+TeL+".txt";
        }
        

       
          
            //TEST BLOCK 2 (block 5)  
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
                         ITI:2000, // this interval is used to present feedback if any
                         respTimeOut: 200000,
                         mediaType: 'audio',
                         namespace: 'test2'}); 
                                              
                     e.addBlock({
                              block: test2Block,
                              instructions:['<p>During this block, no feedback will be provided.</p>',
                  		  					"<p><span style='font-weight:bold;'>Please respond as quickly as possible. We encourage you to keep your fingers on the two keys ('D' and 'T') throughout this part.</span></p>",
                          					'<p><font color="red">It is important that you keep your volume at the same level throughout the experiment.</font></p>',
								],
                              onPreview: false,
                      });
                  
                $("#continue").hide();
                e.nextBlock();     

       }
    });                 

   }
   /*End of Rest of the experiment here*/
});  
