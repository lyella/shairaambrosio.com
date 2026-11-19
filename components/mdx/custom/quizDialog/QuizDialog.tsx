import { memo } from "react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import clsx from "clsx";

import { Input } from "components/common/input/Input";
import CrossIcon from "public/svg/cross.svg";
import PlusIcon from "public/svg/plus.svg";

import styles from "./quizDialog.module.scss";

type QuizDialogProps = {
  readonly correctAnswers: (string | number)[];
  readonly scoreMessages: { score: number; message: string }[];
};

type Answer = {
  readonly id: number;
  readonly text: string;
  readonly status: "unchecked" | "correct" | "incorrect";
};

const AnswerItem = ({ answer, onDeleteAnswer }: { answer: Answer; onDeleteAnswer: any }) => {
  return (
    <li>
      <button className={clsx(styles.answer, styles[answer.status])} onClick={onDeleteAnswer}>
        {answer.status === "unchecked" ? (
          <div className={styles.close}>
            <CrossIcon />
          </div>
        ) : null}
        <span className={styles.text}>{answer.text}</span>
      </button>
    </li>
  );
};

export const QuizDialog = memo<QuizDialogProps>(({ correctAnswers, scoreMessages }) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isAnswersChecked, setIsAnswersChecked] = useState(false);
  const [isResultMessageShown, setIsResultMessageShown] = useState(false);
  const [score, setScore] = useState(0);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const isNotInAnswers = (inputType: string) => {
    return inputType.trim() && !answers.find((answer) => answer.text === inputType);
  };

  const handleFormSubmit = ({ inputType }: { [key: string]: string }) => {
    const givenAnswer = {
      id: answers.length + 1,
      text: inputType.trim(),
      status: "unchecked" as const,
    };

    setAnswers((answers) => [...answers, givenAnswer]);
    reset();
  };

  const handleDeleteAnswer = (id: number) => {
    const answer = answers.find((answer) => answer.id === id);
    if (answer?.status === "unchecked") {
      setAnswers((answers) => answers.filter((answer) => answer.id !== id));
    }
  };

  const handleCheckAnswers = () => {
    // Score against the answers as they will be AFTER this update. The old code
    // read `answers` from the closure, so checking a quiz with N answers scored
    // N-1 of them and the first answer never counted.
    const checkedAnswers = answers.map((answer) => ({
      ...answer,
      status: correctAnswers.includes(answer.text.toLowerCase().trim()) ? ("correct" as const) : ("incorrect" as const),
    }));

    setAnswers(checkedAnswers);
    setIsAnswersChecked(true);
    reset();

    const correctProvidedAnswersCount = checkedAnswers.filter((answer) => answer.status === "correct").length;

    setScore((correctProvidedAnswersCount / Math.max(correctAnswers.length, 1)) * 100);

    setTimeout(() => {
      setIsResultMessageShown(true);
    }, 500);
  };

  const handleResetAnswers = () => {
    // Derive the dependent flag at the same moment the answers are cleared instead
    // of syncing it from an effect that watched `answers`.
    setAnswers([]);
    setIsAnswersChecked(false);
    setIsResultMessageShown(false);
  };

  return (
    // Wrapped in a single form element. The previous version returned a fragment,
    // which makes MDX treat the component as possibly-empty (React 19 types this
    // as `ReactNode`, not `Element`); more importantly, the <form> and the answer
    // controls were siblings in the MDX document, so they were not one landmark.
    <div className={styles.quiz}>
      <form className={styles.form} onSubmit={handleSubmit(handleFormSubmit)}>
        <Input
          type="text"
          placeholder="Type your answer here..."
          isError={!!errors.inputType}
          {...register("inputType", {
            required: true,
            validate: isNotInAnswers,
          })}
          disabled={answers.length >= correctAnswers.length || isAnswersChecked}
        >
          <span className="sr-only">input type</span>
        </Input>
        <button className={styles.btn} disabled={answers.length >= correctAnswers.length || isAnswersChecked}>
          Add <PlusIcon />
        </button>
      </form>
      <div className={styles.answersWrapper}>
        {answers.length === 0 ? (
          <div className={styles.placeholder}>Your answers will appear here.</div>
        ) : (
          <ul className={styles.answers}>
            {answers.map((answer) => (
              <AnswerItem key={answer.id} answer={answer} onDeleteAnswer={() => handleDeleteAnswer(answer.id)} />
            ))}
          </ul>
        )}
        <div className={clsx(styles.result, { [styles.active]: isResultMessageShown })}>
          <strong>Your result is {score.toFixed(0)}%</strong>
          <div className={styles.message}>
            {scoreMessages.find((scoreMessage) => scoreMessage.score <= score)?.message}
          </div>
        </div>
        {isAnswersChecked ? (
          <button
            className={styles.resultBtn}
            onClick={() => (isResultMessageShown ? setIsResultMessageShown(false) : setIsResultMessageShown(true))}
          >
            {isResultMessageShown ? "Hide" : "Show"}
          </button>
        ) : null}
      </div>
      <div className={styles.info}>
        <div className={styles.buttons}>
          <button
            className={clsx(styles.button, styles.check)}
            onClick={handleCheckAnswers}
            disabled={answers.length === 0 || isAnswersChecked}
          >
            Check
          </button>
          <button
            className={clsx(styles.button, styles.reset)}
            onClick={handleResetAnswers}
            disabled={answers.length === 0}
          >
            Reset
          </button>
        </div>
        <div className={styles.counter}>
          {answers.length}/{correctAnswers.length}
        </div>
      </div>
    </div>
  );
});

QuizDialog.displayName = "QuizDialog";
