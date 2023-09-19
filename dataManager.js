import modules from './json/modules.json';
import questions from './json/questions.json';

export function UpdateChapterQuestion (moduleIndex, chapterIndex, questionIndex) {
  //copy the questions.json file to the backend folder
  //update the question
  var updatedQuestions = questions;
  updatedQuestions.module[moduleIndex].chapters[chapterIndex].questions[questionIndex].finished = true;
  console.log(updatedQuestions);
  //return await writeJsonFile('foo.json', {foo: true});
  return updatedQuestions;
}

// // Read JSON data from a file
// const readData = (filePath) => {
//   try {
//     const data = readFileSync(filePath, 'utf8');
//     return JSON.parse(data);
//   } catch (error) {
//     console.error('Error reading JSON data:', error);
//     return null;
//   }
// };

// // Write JSON data to a file
// const writeData = (filePath, data) => {
//   try {
//     writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
//     console.log('Data written successfully.');
//   } catch (error) {
//     console.error('Error writing JSON data:', error);
//   }
// };