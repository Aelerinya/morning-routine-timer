import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Play, Pause, SkipForward, Plus, Minus } from "lucide-react";

interface Step {
  name: string;
  duration: number;
  url?: string; // New optional property for the URL
}

const useTimer = (initialTime: number, onTimerEnd: () => void) => {
  const [timeLeft, setTimeLeft] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(false);
  const [totalTime, setTotalTime] = useState(0);
  const [totalOvertime, setTotalOvertime] = useState(0);
  const [isOvertime, setIsOvertime] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime > 0) {
            setTotalTime((prevTotal) => prevTotal + 1);
            return prevTime - 1;
          } else {
            if (prevTime === 0) {
              setIsOvertime(true);
              onTimerEnd();
            }
            setTotalTime((prevTotal) => prevTotal + 1);
            setTotalOvertime((prevOvertime) => prevOvertime + 1);
            return prevTime - 1;
          }
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRunning, onTimerEnd]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = (newTime: number) => {
    setTimeLeft(newTime);
    setIsOvertime(false);
    setIsRunning(true);
  };

  return {
    timeLeft,
    isRunning,
    totalTime,
    totalOvertime,
    isOvertime,
    startTimer,
    pauseTimer,
    resetTimer,
  };
};

const useSteps = (initialSteps: Step[]) => {
  const [steps, setSteps] = useState(initialSteps);
  const [currentStep, setCurrentStep] = useState(0);
  const [isRoutineFinished, setIsRoutineFinished] = useState(false);
  const [progress, setProgress] = useState(0);

  const calculateProgress = useCallback(
    (stepIndex: number) => {
      const totalDuration = steps.reduce(
        (sum, step) => sum + step.duration * 60,
        0
      );
      const completedDuration = steps
        .slice(0, stepIndex)
        .reduce((sum, step) => sum + step.duration * 60, 0);
      const currentProgress = (completedDuration / totalDuration) * 100;
      return Math.min(currentProgress, 100);
    },
    [steps]
  );

  const goToNextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prevStep) => {
        const nextStep = prevStep + 1;
        const newProgress = calculateProgress(nextStep);
        setProgress(newProgress);
        return nextStep;
      });
      return steps[currentStep + 1].duration * 60;
    } else {
      setIsRoutineFinished(true);
      setProgress(100);
      return null;
    }
  }, [steps, currentStep, calculateProgress]);

  const getCurrentStepDuration = useCallback(() => {
    return steps[currentStep].duration * 60;
  }, [steps, currentStep]);

  const updateSteps = (newSteps: Step[]) => {
    setSteps(newSteps);
    setCurrentStep(0);
    setIsRoutineFinished(false);
    setProgress(0);
  };

  return {
    steps,
    currentStep,
    isRoutineFinished,
    progress,
    goToNextStep,
    getCurrentStepDuration,
    updateSteps,
  };
};

const useSound = () => {
  const playSound = useCallback(() => {
    const audioContext = new window.AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(440, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  return { playSound };
};

const RoutineEditor = ({
  steps,
  updateSteps,
}: {
  steps: Step[];
  updateSteps: (newSteps: Step[]) => void;
}) => {
  const [editedSteps, setEditedSteps] = useState(steps);

  const handleStepChange = (
    index: number,
    field: keyof Step,
    value: string
  ) => {
    const newSteps = [...editedSteps];
    if (field === "name") {
      newSteps[index].name = value;
    } else if (field === "duration") {
      newSteps[index].duration = parseInt(value) || 0;
    } else if (field === "url") {
      newSteps[index].url = value;
    }
    setEditedSteps(newSteps);
  };

  const addStep = () => {
    setEditedSteps([
      ...editedSteps,
      { name: "New Step", duration: 5, url: "" },
    ]);
  };

  const removeStep = (index: number) => {
    const newSteps = editedSteps.filter((_, i) => i !== index);
    setEditedSteps(newSteps);
  };

  const saveChanges = () => {
    updateSteps(editedSteps);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {editedSteps.map((step, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Input
              value={step.name}
              onChange={(e) => handleStepChange(index, "name", e.target.value)}
              className="flex-grow"
            />
            <Input
              type="number"
              value={step.duration}
              onChange={(e) =>
                handleStepChange(index, "duration", e.target.value)
              }
              className="w-20"
            />
            <Input
              value={step.url || ""}
              onChange={(e) => handleStepChange(index, "url", e.target.value)}
              placeholder="URL (optional)"
              className="flex-grow"
            />
            <Button
              onClick={() => removeStep(index)}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              <Minus />
            </Button>
          </div>
        ))}
        <Button
          onClick={addStep}
          className="bg-green-500 hover:bg-green-600 text-white"
        >
          <Plus className="mr-2" />
          Add Step
        </Button>
      </div>
      <Button
        onClick={saveChanges}
        className="w-full bg-slate-500 hover:bg-slate-600 text-white"
      >
        Save Changes
      </Button>
    </div>
  );
};

interface TimerContentProps {
  steps: Step[];
  currentStep: number;
  timeLeft: number;
  isRunning: boolean;
  totalTime: number;
  totalOvertime: number;
  isOvertime: boolean;
  startTimer: () => void;
  pauseTimer: () => void;
  startNextStep: () => void;
}

const TimerContent = ({
  steps,
  currentStep,
  timeLeft,
  isRunning,
  totalTime,
  totalOvertime,
  isOvertime,
  startTimer,
  pauseTimer,
  startNextStep,
}: TimerContentProps) => {
  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const sign = seconds < 0 ? "-" : "";
    return `${sign}${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        {steps[currentStep].url ? (
          <h3 className="text-xl font-bold underline">
            <a
              href={steps[currentStep].url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {steps[currentStep].name}
            </a>
          </h3>
        ) : (
          <h3 className="text-xl font-bold">{steps[currentStep].name}</h3>
        )}
        <p
          className={`text-3xl font-bold ${
            isOvertime ? "text-red-300" : "text-white"
          }`}
        >
          <Clock className="inline-block mr-2" />
          {formatTime(timeLeft)}
        </p>
      </div>
      <div className="flex justify-between space-x-2">
        <Button
          onClick={() => (isRunning ? pauseTimer() : startTimer())}
          className="flex-1 bg-slate-500 hover:bg-slate-600 text-white"
          variant="default"
        >
          {isRunning ? <Pause className="mr-2" /> : <Play className="mr-2" />}
          {isRunning ? "Pause" : "Start"}
        </Button>
        <Button
          onClick={startNextStep}
          className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          variant="default"
        >
          <SkipForward className="mr-2" />
          {currentStep === steps.length - 1 ? "End" : "Next Step"}
        </Button>
      </div>
      <Separator className="bg-slate-400" />
      <div className="flex items-center justify-between text-sm">
        <span>Total Time: {formatTime(totalTime)}</span>
        <span className="text-red-300">
          Overtime: {formatTime(totalOvertime)}
        </span>
      </div>
    </div>
  );
};

const MorningRoutineTimer = () => {
  const initialSteps: Step[] = [
    {
      name: "Read Mnestic",
      duration: 1,
      url: "obsidian://open?vault=Chaos&file=Resources%2FMnestic",
    },
    { name: "Sunsama init", duration: 2 },
    {
      name: "Log sleep stats TT",
      duration: 3,
      url: "https://appx.tenacious-tracker.com/tracking",
    },
    {
      name: "Log sleep stats Exist",
      duration: 3,
      url: "https://exist.io/review/",
    },
    {
      name: "Look at calendar",
      duration: 1,
      url: "https://calendar.google.com/calendar/u/0/r",
    },
    {
      name: "Look at todo list",
      duration: 2,
      url: "https://app.todoist.com/app/today",
    },
    {
      name: "Review last day on Intend",
      duration: 10,
      url: "https://intend.do/aelerinya/now",
    },
    {
      name: "Set intention for the day on Intend",
      duration: 4,
      url: "https://intend.do/aelerinya/today",
    },
    {
      name: "Sunsama finish plan",
      duration: 5,
    },
  ];

  const {
    steps,
    currentStep,
    isRoutineFinished,
    progress,
    goToNextStep,
    getCurrentStepDuration,
    updateSteps,
  } = useSteps(initialSteps);

  const { playSound } = useSound();

  const onTimerEnd = useCallback(() => {
    playSound();
  }, [playSound]);

  const {
    timeLeft,
    isRunning,
    totalTime,
    totalOvertime,
    isOvertime,
    startTimer,
    pauseTimer,
    resetTimer,
  } = useTimer(getCurrentStepDuration(), onTimerEnd);

  const startNextStep = useCallback(() => {
    const nextStepDuration = goToNextStep();
    if (nextStepDuration !== null) {
      resetTimer(nextStepDuration);
      // Open the URL of the next step if it exists
      const nextStepUrl = steps[currentStep + 1]?.url;
      if (nextStepUrl) {
        window.open(nextStepUrl, "_blank");
      }
    } else {
      pauseTimer();
    }
  }, [goToNextStep, resetTimer, pauseTimer, steps, currentStep]);

  const formatTime = (seconds: number) => {
    const absSeconds = Math.abs(seconds);
    const mins = Math.floor(absSeconds / 60);
    const secs = absSeconds % 60;
    const sign = seconds < 0 ? "-" : "";
    return `${sign}${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-2xl">
        <Tabs defaultValue="timer" className="space-y-4">
          <div className="bg-slate-700 rounded-t-lg shadow-xl overflow-hidden">
            <Card className="bg-transparent border-none text-white">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  Customizable Morning Routine Timer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-6 space-y-2">
                  <div className="h-3 bg-slate-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-white transition-all duration-300 ease-in-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-right text-slate-200">
                    Progress: {Math.round(progress)}%
                  </div>
                </div>
                <TabsContent value="timer">
                  {isRoutineFinished ? (
                    <div className="text-center">
                      <h2 className="text-2xl font-bold mb-4">
                        Congratulations!
                      </h2>
                      <p className="text-lg mb-4">
                        You've completed your morning routine.
                      </p>
                      <div className="space-y-2">
                        <p>
                          Total Time:{" "}
                          <span className="font-bold">
                            {formatTime(totalTime)}
                          </span>
                        </p>
                        <p className="text-red-300">
                          Overtime:{" "}
                          <span className="font-bold">
                            {formatTime(totalOvertime)}
                          </span>
                        </p>
                      </div>
                    </div>
                  ) : (
                    <TimerContent
                      steps={steps}
                      currentStep={currentStep}
                      timeLeft={timeLeft}
                      isRunning={isRunning}
                      totalTime={totalTime}
                      totalOvertime={totalOvertime}
                      isOvertime={isOvertime}
                      startTimer={startTimer}
                      pauseTimer={pauseTimer}
                      startNextStep={startNextStep}
                    />
                  )}
                </TabsContent>
                <TabsContent value="editor">
                  <RoutineEditor steps={steps} updateSteps={updateSteps} />
                </TabsContent>
              </CardContent>
            </Card>
          </div>
          <TabsList className="grid w-full grid-cols-2 bg-slate-600 rounded-b-lg">
            <TabsTrigger
              value="timer"
              className="data-[state=active]:bg-slate-700"
            >
              Timer
            </TabsTrigger>
            <TabsTrigger
              value="editor"
              className="data-[state=active]:bg-slate-700"
            >
              Edit Routine
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
};

export default MorningRoutineTimer;
