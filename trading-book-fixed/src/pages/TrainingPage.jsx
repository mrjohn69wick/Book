import { useState } from 'react';
import './SimplePage.css';

const questions = [
  {
    text: 'وفقًا لقانون «لا شك»، ما المقصود بهذا التصنيف؟',
    options: ['حتمية مطلقة بلا إدارة مخاطر', 'أعلى درجة ترجيح مع بقاء إدارة المخاطر', 'إشارة للمناطق غير القابلة للقياس'],
    answerIndex: 1,
    explanation: 'التصنيف «لا شك» يعني أعلى ترجيح ولا يلغي احتمال الانعكاس أو قواعد الوقف.'
  },
  {
    text: 'قانون إدارة الاحتمالات بالوقف وعكس الوقف يركز على:',
    options: ['الدخول بدون وقف للحفاظ على الصفقة', 'تحويل الاحتمالات إلى سيناريوهات متوازنة مع عكس الوقف', 'إلغاء فكرة الوقف تمامًا'],
    answerIndex: 1,
    explanation: 'القانون يشرح أن الوقف وعكس الوقف جزء من إدارة السيناريوهات وليس خطأً.'
  },
  {
    text: 'في البيئة القياسية، ما المهارة الأساسية التي يجب إتقانها أولًا؟',
    options: ['توقع الأخبار الاقتصادية', 'اكتشاف البيئة التي يسير عليها السعر', 'زيادة عدد الصفقات دون تحليل'],
    answerIndex: 1,
    explanation: 'القانون يوضح أن المهارة الأولى هي اكتشاف البيئة القياسية الحالية.'
  },
  {
    text: 'ما الشرط الأساسي لاعتماد «ناقل حاصل» بصورة لا شك فيها؟',
    options: ['ظهور زاوية واضحة بعد انتهاء الوحدة مع لمس/كسر 1.236', 'أي حركة عشوائية داخل النطاق', 'وجود تداخل دون إغلاق واضح'],
    answerIndex: 0,
    explanation: 'الناقل الحاصل يُعتمد بعد نهاية الوحدة وظهور زاوية واضحة مع شرط 1.236.'
  },
  {
    text: 'بيئة «التداخل» توصف في القوانين بأنها:',
    options: ['بيئة لا شك فيها دائمًا', 'بيئة مشكوك فيها وتحتاج حذرًا', 'بيئة تلغي الوقف نهائيًا'],
    answerIndex: 1,
    explanation: 'التداخل لا يكسر دعمًا ولا يخترق مقاومة وتُعد دائمًا مشكوكًا فيها.'
  },
  {
    text: 'القانون يذكر أن السعر ليس لعبة فريقين بل:',
    options: ['اتزانات خاضعة لرياضيات الفوضى', 'نتيجة عشوائية بلا قواعد', 'صراع أخبار فقط'],
    answerIndex: 0,
    explanation: 'الفلسفة الأساسية تؤكد أن السعر اتزانات خاضعة لرياضيات الفوضى.'
  }
];

const TrainingPage = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [score, setScore] = useState(0);
  const [showSummary, setShowSummary] = useState(false);

  const currentQuestion = questions[currentIndex];
  const answered = selectedIndex !== null;
  const isCorrect = answered && selectedIndex === currentQuestion.answerIndex;

  const handleAnswer = (optionIndex) => {
    if (answered) {
      return;
    }
    setSelectedIndex(optionIndex);
    if (optionIndex === currentQuestion.answerIndex) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    if (!answered) {
      return;
    }
    if (currentIndex === questions.length - 1) {
      setShowSummary(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedIndex(null);
    setScore(0);
    setShowSummary(false);
  };

  return (
    <div className="simple-page">
      <h1 className="page-title">حالات التدريب</h1>
      <p className="page-subtitle">اختبر فهمك للقوانين عبر أسئلة قصيرة تفاعلية.</p>

      {showSummary ? (
        <div className="quiz-summary">
          <h2>🎉 أحسنت! أنهيت التدريب الأساسي.</h2>
          <p>
            نتيجتك: {score} من {questions.length}
          </p>
          <button className="quiz-button primary" onClick={handleRestart}>
            إعادة المحاولة
          </button>
        </div>
      ) : (
        <div className="quiz-card">
          <div className="quiz-progress">
            السؤال {currentIndex + 1} من {questions.length}
          </div>
          <h2 className="quiz-question">{currentQuestion.text}</h2>

          <div className="quiz-options">
            {currentQuestion.options.map((option, optionIndex) => {
              const isSelected = selectedIndex === optionIndex;
              const isAnswer = optionIndex === currentQuestion.answerIndex;
              const optionState =
                answered && isSelected ? (isCorrect ? 'correct' : 'incorrect') : '';
              const revealCorrect = answered && isAnswer && !isCorrect ? 'correct' : '';
              return (
                <button
                  key={option}
                  className={`quiz-option ${optionState} ${revealCorrect}`}
                  onClick={() => handleAnswer(optionIndex)}
                  disabled={answered}
                >
                  {option}
                </button>
              );
            })}
          </div>

          {answered && (
            <div className={`quiz-feedback ${isCorrect ? 'correct' : 'incorrect'}`}>
              {isCorrect ? '✅ إجابة صحيحة!' : `❌ إجابة غير صحيحة. ${currentQuestion.explanation}`}
            </div>
          )}

          <div className="quiz-actions">
            <button className="quiz-button" onClick={handleNext} disabled={!answered}>
              {currentIndex === questions.length - 1 ? 'إنهاء التدريب' : 'التالي'}
            </button>
            <button className="quiz-button ghost" onClick={handleRestart}>
              إعادة التمرين
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default TrainingPage;
