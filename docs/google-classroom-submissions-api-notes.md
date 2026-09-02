# Google Classroom studentSubmissions — referências

A documentação oficial informa que `courses.courseWork.studentSubmissions.list` aceita `courseWorkId` como `-` para retornar submissions de múltiplas atividades de um curso, suporta `pageToken`/`nextPageToken` e exige um dos escopos `classroom.coursework.students.readonly`, `classroom.coursework.me.readonly`, `classroom.coursework.students` ou `classroom.coursework.me`.

A API expõe `id`, `courseId`, `courseWorkId`, `userId`, `creationTime`, `updateTime`, `state`, `late`, `draftGrade`, `assignedGrade`, `alternateLink` e `submissionHistory`. As notas são somente leitura nesta implementação. O Google diferencia `draftGrade` e `assignedGrade`; nenhuma operação de escrita de notas ou alteração de estado deve ser feita nesta fase.

Referências:

- https://developers.google.com/workspace/classroom/reference/rest/v1/courses.courseWork.studentSubmissions/list
- https://developers.google.com/workspace/classroom/reference/rest/v1/courses.courseWork.studentSubmissions
- https://developers.google.com/workspace/classroom/guides/classroom-api/manage-grades
