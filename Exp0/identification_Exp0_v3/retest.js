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
            consentForm: 'https://www.hlp.rochester.edu/mturk/xxie/NIH_pilot/consent/Prolific_Consent_1013_2021.pdf'
         //   survey: '../surveys/priming_survey_shorts.html' //Post-experiment survey that will show up at the very end of the experiment
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
    var condition = 'retest';
   // var TrL = 'A';    //which training list A or B
    var TeL = '1'; //which test list for test block 1 & 2: 1,2,3,4,5,6
    var ListOrder = '1';
   // var isTest = e.urlparams['test']; // Should tell us which probes are being use for test and training
    
    //start of instructions section
    var instructions = new InstructionsSubsectionsBlock(
            {
                logoImg: '../img/logo.png',
                title: 'Listen and Decide_PART2',
                mainInstructions: ['Thanks for joining us for PART 2 of our study! We are trying to understand how people comprehend speech. In this part, you will listen to speech sounds and make a decision about what you hear. Your response will provide critical information that helps us to advance speech technology.',
                				   'This experiment will take about 5 minutes and you will be paid $1.00.',
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
             //   instrImg: '../img/block_procedure.png',
                instrStyle: 'logo2',
                title: 'Listen and decide!',
                mainInstructions: [
                                   'This experiment only has 3 short blocks. In these blocks, you will be asked to judge <font color="blue">whether a word you heard ended with the sound “d” (as in <em>be<u>d</u></em>) or “t” (as in <em>be<u>t</em></u>)</font>.', 
                                   '<span style="font-weight:bold;">You can respond as soon as the audio play finishes. Please respond <u>as accurately and as quickly as possible</u>. Your performance will be tracked throughout the experiment. ',
                  ],
                buttonInstructions: 'Start Block 1',
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
       // if (ListOrder === "1") {
            test0Prefix = "../stimuli/Test/Mandarin_speaker5/";
            test1_LONG_Prefix = "../stimuli/Test/Mandarin_speaker5/";
            test2_LONG_Prefix = "../stimuli/Test/Mandarin_speaker5/";
            test0List = "../lists/Test/Test0_List"+TeL+".txt";
            test1_LONG_List = "../lists/Test/Test_LONG/Test1_List1"+ListOrder+".txt"; 
            test2_LONG_List = "../lists/Test/Test_LONG/Test2_List1"+ListOrder+".txt";
      //  }

        //TEST BLOCK SHORT
                    
         Papa.parse(test0List, {
            download: true,
            header: true,
            delimiter: '|',
            skipEmptyLines: true,
            complete: function(results) {
                var test0Stim = new ExtendedStimuliFileList(
                    {
                        prefix: test0Prefix,
                        mediaType: 'audio',
                        filenames: getFromPapa(results, 'Filename'),
                        probes: getFromPapa(results, 'Target'),
                        correctKeys: getFromPapa(results,'CorrectAnswer')
                    });
                var test0Block = new IdentificationBlock({stimuli: test0Stim,
                     blockRandomizationMethod: "shuffle",
                     trialInstructions: 'Does the word end in "d" or "t"?',
                     reps: 1,
                     respKeys: {'D': 'd', 'T': 't'}, 
                     categories: ['d', 't'], 
                     fixationTime: 500,
                     ITI:2000, // this interval is used to present feedback if any
                     respTimeOut: 200000,
                     mediaType: 'audio',
                     namespace: 'test0'
                     }); 
                                              
                 e.addBlock({
                          block: test0Block,
                          instructions:['<p>During this block, no feedback will be provided.</p>',
                  		  "<p><span style='font-weight:bold;'>Please respond as accurately and as quickly as possible. We encourage you to keep your fingers on the two keys ('D' and 'T') throughout this part.</span></p>",
                          '<p><font color="red">It is important that you keep your volume at the same level throughout the experiment.</font></p>',
                      
                          ],
                          onPreview: false,
                  });
        
        
        //Instructions before the long test block 1
           var instructions_block1 = new InstructionsSubsectionsBlock(
            {
              //  instrImg: '../img/LD_task.png',
                instrStyle: 'logo2',
                title: '<span style="font-weight:bold;"><font color="blue">Block 2: D or T?</font></span>',
                mainInstructions: ["<p>You have completed Block 1. </p>",
                                   "<p>In Block 2, you will hear speech from the same voice and the task remains the same. This block is slightly longer and takes about 2 mins. </p>",
                                 //  "<p><span style='font-weight:bold;'>Respond as quickly as possible without sacrificing accuracy. We encourage you to keep your fingers on the two keys ('D' and 'T') throughout this part.</span></p>", 
                   ],
                buttonInstructions: 'Begin Block 2',
                beginMessage: 'Click when ready',
                exptInstructions: false,

            });
            
        e.addBlock({block: instructions_block1,
                    onPreview: true,
                    showInTest: true //showInTest: when urlparam for mode=test, don't add the block
        });  // onPreview = true for blocks that can be viewed BEFORE the worker accepts a HIT. To get an idea of what this means, try to go through the HIT without accepting it and see how far you get

       
            //TEST BLOCK LONG 1
             Papa.parse(test1_LONG_List, {
                download: true,
                header: true,
                delimiter: '|',
                skipEmptyLines: true,
                complete: function(results) {
                    var test1_LONG_Stim = new ExtendedStimuliFileList(
                        {
                            prefix: test1_LONG_Prefix,
                            mediaType: 'audio',
                            filenames: getFromPapa(results, 'Filename'),
                            probes: getFromPapa(results, 'Target'),
                            correctKeys: getFromPapa(results,'CorrectAnswer')
                        });
                    var test1_LONG_Block = new IdentificationBlock({stimuli: test1_LONG_Stim,
                         blockRandomizationMethod: "shuffle",
                         trialInstructions: "Does the word end in /d/ or /t/?",
                         reps: 1,
                         respKeys: {'D': 'd', 'T': 't'}, 
                         categories: ['d', 't'], 
                         fixationTime: 500,
                         ITI:2000, // this interval is used to present feedback if any
                         respTimeOut: 200000,
                         mediaType: 'audio',
                         namespace: 'test1_LONG'}); 
                                              
                     e.addBlock({
                              block: test1_LONG_Block,
                              instructions:['<p>During this block, no feedback will be provided.</p>',
                  		  					"<p><span style='font-weight:bold;'>Please respond as quickly as possible. We encourage you to keep your fingers on the two keys ('D' and 'T') throughout this part.</span></p>",
                          					'<p><font color="red">It is important that you keep your volume at the same level throughout the experiment.</font></p>',
								],
                              onPreview: false,
                      });  
                
            //Instructions before the long test block 2
           var instructions_block2 = new InstructionsSubsectionsBlock(
            {
              //  instrImg: '../img/LD_task.png',
                instrStyle: 'logo2',
                title: '<span style="font-weight:bold;"><font color="blue">Block 3: D or T?</font></span>',
                mainInstructions: ["<p>You have completed Block 2. </p>",
                                   "<p>In Block 3, you will hear speech from the same voice and the task remains the same. This block takes about 2 mins. </p>",
                                 //  "<p><span style='font-weight:bold;'>Respond as quickly as possible without sacrificing accuracy. We encourage you to keep your fingers on the two keys ('D' and 'T') throughout this part.</span></p>", 
                   ],
                buttonInstructions: 'Begin Block 3',
                beginMessage: 'Click when ready',
                exptInstructions: false,

            });
            
        e.addBlock({block: instructions_block2,
                    onPreview: true,
                    showInTest: true //showInTest: when urlparam for mode=test, don't add the block
        });  // onPreview = true for blocks that can be viewed BEFORE the worker accepts a HIT. To get an idea of what this means, try to go through the HIT without accepting it and see how far you get

		       
            //TEST BLOCK LONG 2
             Papa.parse(test2_LONG_List, {
                download: true,
                header: true,
                delimiter: '|',
                skipEmptyLines: true,
                complete: function(results) {
                    var test2_LONG_Stim = new ExtendedStimuliFileList(
                        {
                            prefix: test2_LONG_Prefix,
                            mediaType: 'audio',
                            filenames: getFromPapa(results, 'Filename'),
                            probes: getFromPapa(results, 'Target'),
                            correctKeys: getFromPapa(results,'CorrectAnswer')
                        });
                    var test2_LONG_Block = new IdentificationBlock({stimuli: test2_LONG_Stim,
                         blockRandomizationMethod: "shuffle",
                         trialInstructions: "Does the word end in /d/ or /t/?",
                         reps: 1,
                         respKeys: {'D': 'd', 'T': 't'}, 
                         categories: ['d', 't'], 
                         fixationTime: 500,
                         ITI:2000, // this interval is used to present feedback if any
                         respTimeOut: 200000,
                         mediaType: 'audio',
                         namespace: 'test2_LONG'}); 
                                              
                     e.addBlock({
                              block: test2_LONG_Block,
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
		});   

       }
    });                 

   }
   /*End of Rest of the experiment here*/
});  
