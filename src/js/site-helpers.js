export default (CommandManager) => {
  CommandManager.alias('about',    'cat ~/about.md');
  CommandManager.alias('contact',  'cat ~/contact.md');
  CommandManager.alias('resume',   'cat ~/resume.md');
  CommandManager.alias('projects', 'cat ~/projects.md');
};
