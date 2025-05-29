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

const PrivacyPage: React.FC = () => {
    return (
        <Box sx={{ py: 4, bgcolor: 'background.default' }}>
            <Seo
                title="Политика конфиденциальности | JobSolution"
                description="Политика конфиденциальности JobSolution: информация о сборе, использовании и защите ваших персональных данных."
            />
            <Container maxWidth="md">
                <Paper elevation={0} sx={{ p: 4, borderRadius: 2 }}>
                    <Typography variant="h4" component="h1" gutterBottom fontWeight={600} color="primary">
                        🛡 Политика конфиденциальности
                    </Typography>

                    <Typography variant="subtitle1" color="text.secondary" paragraph>
                        Дата вступления в силу: 29 мая 2025 г.
                    </Typography>

                    <Typography variant="subtitle1" paragraph>
                        Сайт: JobSolution (jobsolution.kz)
                    </Typography>

                    <Divider sx={{ my: 3 }} />

                    <Typography variant="h5" component="h2" gutterBottom fontWeight={500}>
                        1. Какие данные мы собираем:
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Мы собираем следующие персональные данные, которые вы предоставляете при заполнении форм или оставлении отзывов:
                    </Typography>

                    <List>
                        <ListItem>
                            <ListItemText primary="Имя и фамилия" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Номер телефона" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Электронная почта" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Любые данные, которые вы добровольно указываете в отзывах" />
                        </ListItem>
                    </List>

                    <Typography variant="h5" component="h2" gutterBottom fontWeight={500} sx={{ mt: 2 }}>
                        2. Как мы используем ваши данные:
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Ваши данные используются для:
                    </Typography>

                    <List>
                        <ListItem>
                            <ListItemText primary="Публикации отзывов на сайте" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Связи с вами по вопросам модерации или уточнения информации" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Улучшения качества сервиса JobSolution" />
                        </ListItem>
                    </List>

                    <Typography variant="body1" paragraph>
                        Мы не передаём ваши данные третьим лицам без вашего согласия, за исключением случаев, предусмотренных законодательством Республики Казахстан.
                    </Typography>

                    <Typography variant="h5" component="h2" gutterBottom fontWeight={500} sx={{ mt: 2 }}>
                        3. Безопасность данных:
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Мы применяем организационные и технические меры для защиты ваших персональных данных от несанкционированного доступа, изменения или уничтожения.
                    </Typography>

                    <Typography variant="h5" component="h2" gutterBottom fontWeight={500} sx={{ mt: 2 }}>
                        4. Хранение данных:
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Мы храним ваши данные столько, сколько это необходимо для целей, указанных выше, или в соответствии с требованиями законодательства.
                    </Typography>

                    <Typography variant="h5" component="h2" gutterBottom fontWeight={500} sx={{ mt: 2 }}>
                        5. Ваши права:
                    </Typography>

                    <Typography variant="body1" paragraph>
                        Вы имеете право:
                    </Typography>

                    <List>
                        <ListItem>
                            <ListItemText primary="Запросить доступ к вашим данным" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Потребовать их исправления или удаления" />
                        </ListItem>
                        <ListItem>
                            <ListItemText primary="Отозвать своё согласие на обработку данных" />
                        </ListItem>
                    </List>

                    <Typography variant="body1" paragraph>
                        Для этого напишите нам на: job.solution@inbox.ru
                    </Typography>
                </Paper>
            </Container>
        </Box>
    );
};

export default PrivacyPage; 