import {
    Box,
    Container,
    Divider,
    List,
    ListItem,
    ListItemText,
    Paper,
    Typography
} from '@mui/material';
import React from 'react';
import { Seo } from '../shared/components';

const TermsPage: React.FC = () => {
    return (
        <Box sx={{ py: 4, bgcolor: 'background.default' }}>
            <Seo
                title="Условия использования | JobSolution"
                description="Условия использования платформы JobSolution: правила и обязанности пользователей сервиса."
            />
            <Container maxWidth="md">
                <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight={600} color="primary">
                        📜 Условия использования
                    </Typography>

                    <Typography variant="subtitle1" color="text.secondary" paragraph>
                        Дата вступления в силу: 29 мая 2025 г.
                    </Typography>

                    <Typography variant="subtitle1" paragraph>
                        Сайт: JobSolution (jobsolution.kz)
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom fontWeight={500}>
                        1. Общие положения:
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Используя сайт JobSolution, вы соглашаетесь с настоящими Условиями использования и обязуетесь их соблюдать.
                    </Typography>

                    <Typography variant="h5" component="h2" gutterBottom fontWeight={500} sx={{ mt: 2 }}>
                        2. Цель сайта:
                    </Typography>

                    <Typography variant="body1" paragraph>
                        JobSolution предоставляет платформу для публикации отзывов о работодателях. Пользователи могут оставлять мнения, которые должны быть честными, основанными на личном опыте и не нарушать закон.
                    </Typography>

                    <Typography variant="h5" component="h2" gutterBottom fontWeight={500} sx={{ mt: 2 }}>
                        3. Обязанности пользователя:
                    </Typography>

                    <List>
                        <ListItem>
                            <ListItemText primary="Указывать достоверные данные" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Не публиковать ложную или оскорбительную информацию" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Соблюдать нормы законодательства Республики Казахстан" />
                        </ListItem>
                    </List>

                    <Typography variant="h5" component="h2" gutterBottom fontWeight={500} sx={{ mt: 2 }}>
                        4. Ограничение ответственности:
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Мы не несём ответственности за содержание отзывов пользователей, но оставляем за собой право удалять отзывы, которые нарушают правила или законодательство.
                    </Typography>

                    <Typography variant="h5" component="h2" gutterBottom fontWeight={500} sx={{ mt: 2 }}>
                        5. Изменения условий:
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Мы можем изменять настоящие Условия использования. Актуальная версия всегда доступна на сайте. Использование сайта после изменений означает согласие с ними.
                    </Typography>

                    <Typography variant="h5" component="h2" gutterBottom fontWeight={500} sx={{ mt: 2 }}>
                        6. Контакты:
                    </Typography>

                    <Typography variant="body1" paragraph>
                        По вопросам, связанным с использованием сайта, пишите на: job.solution@inbox.ru
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default TermsPage; 