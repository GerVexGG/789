#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Mouse Active Time Tracker
Отслеживает активное время использования мыши для Windows
"""

import json
import os
import sys
import time
import threading
from datetime import datetime, date
from pathlib import Path

# Обработка импортов с информированием пользователя
try:
    from pynput import mouse
except ImportError:
    print("Ошибка: библиотека pynput не установлена.")
    print("Установите командой: pip install pynput")
    sys.exit(1)

try:
    import pystray
    from pystray import Icon as icon, MenuItem as item
    from PIL import Image, ImageDraw
except ImportError:
    print("Ошибка: библиотеки pystray или Pillow не установлены.")
    print("Установите командой: pip install pystray Pillow")
    sys.exit(1)

# Константы
INACTIVITY_THRESHOLD = 60  # секунд бездействия
SAVE_INTERVAL = 30  # интервал автосохранения в секундах
DATA_FILE = Path.home() / "mouse_tracker_data.json"
APP_NAME = "Mouse Activity Tracker"


class MouseTracker:
    def __init__(self):
        self.last_activity_time = time.time()
        self.session_start_time = None
        self.active_seconds_today = 0
        self.history = {}
        self.running = False
        self.lock = threading.Lock()
        self.mouse_listener = None
        self.save_thread = None
        
        self._load_data()
        self._initialize_today()
    
    def _load_data(self):
        """Загрузка истории из файла"""
        try:
            if DATA_FILE.exists():
                with open(DATA_FILE, 'r', encoding='utf-8') as f:
                    self.history = json.load(f)
                print(f"История загружена из {DATA_FILE}")
            else:
                self.history = {}
                print("Создана новая история")
        except (json.JSONDecodeError, IOError) as e:
            print(f"Предупреждение: ошибка загрузки истории: {e}")
            self.history = {}
    
    def _save_data(self):
        """Сохранение истории в файл"""
        try:
            with self.lock:
                with open(DATA_FILE, 'w', encoding='utf-8') as f:
                    json.dump(self.history, f, ensure_ascii=False, indent=2)
            print(f"Данные сохранены в {DATA_FILE}")
        except IOError as e:
            print(f"Ошибка сохранения: {e}")
    
    def _initialize_today(self):
        """Инициализация данных за сегодня"""
        today_str = date.today().isoformat()
        
        with self.lock:
            if today_str not in self.history:
                self.history[today_str] = {"active_seconds": 0}
            
            self.active_seconds_today = self.history[today_str].get("active_seconds", 0)
        
        self.session_start_time = time.time()
        self.last_activity_time = time.time()
        print(f"Активное время сегодня: {self._format_time(self.active_seconds_today)}")
    
    def _check_date_change(self):
        """Проверка перехода через полночь"""
        today_str = date.today().isoformat()
        
        with self.lock:
            last_recorded_date = max(self.history.keys()) if self.history else None
            
            if last_recorded_date and last_recorded_date != today_str:
                # Произошел переход через полночь
                print(f"Обнаружен переход через полночь: {last_recorded_date} -> {today_str}")
                
                if today_str not in self.history:
                    self.history[today_str] = {"active_seconds": 0}
                
                self.active_seconds_today = self.history[today_str].get("active_seconds", 0)
                self.session_start_time = time.time()
                self.last_activity_time = time.time()
                self._save_data()
    
    def _format_time(self, seconds):
        """Форматирование времени в читаемый вид"""
        hours = int(seconds // 3600)
        minutes = int((seconds % 3600) // 60)
        secs = int(seconds % 60)
        
        if hours > 0:
            return f"{hours}ч {minutes}м {secs}с"
        elif minutes > 0:
            return f"{minutes}м {secs}с"
        else:
            return f"{secs}с"
    
    def _on_mouse_event(self, *args):
        """Обработчик событий мыши"""
        current_time = time.time()
        
        with self.lock:
            # Проверка на переход через полночь
            self._check_date_change()
            
            # Проверка на бездействие
            idle_time = current_time - self.last_activity_time
            
            if idle_time > INACTIVITY_THRESHOLD:
                # Сессия прервана из-за бездействия
                print(f"Обнаружено бездействие {idle_time:.0f}с. Сессия сброшена.")
                self.session_start_time = current_time
            else:
                # Добавляем активное время
                if self.session_start_time:
                    delta = current_time - self.session_start_time
                    if delta > 0:
                        self.active_seconds_today += delta
                        
                        today_str = date.today().isoformat()
                        self.history[today_str]["active_seconds"] = self.active_seconds_today
                        
                        print(f"Активное время: {self._format_time(self.active_seconds_today)}", end='\r')
            
            self.last_activity_time = current_time
            self.session_start_time = current_time
    
    def _auto_save_worker(self):
        """Фоновый поток для периодического сохранения"""
        while self.running:
            time.sleep(SAVE_INTERVAL)
            if self.running:
                self._save_data()
    
    def start(self):
        """Запуск отслеживания"""
        self.running = True
        self._initialize_today()
        
        # Запуск потока автосохранения
        self.save_thread = threading.Thread(target=self._auto_save_worker, daemon=True)
        self.save_thread.start()
        
        # Запуск слушателя мыши
        self.mouse_listener = mouse.Listener(
            on_move=self._on_mouse_event,
            on_click=self._on_mouse_event,
            on_scroll=self._on_mouse_event
        )
        self.mouse_listener.start()
        
        print(f"\n{APP_NAME} запущен. Отслеживание активности мыши...")
        print(f"Порог бездействия: {INACTIVITY_THRESHOLD} секунд")
        print(f"Автосохранение каждые {SAVE_INTERVAL} секунд")
        print("Нажмите Ctrl+C для остановки или используйте иконку в трее\n")
    
    def stop(self):
        """Остановка отслеживания"""
        self.running = False
        
        if self.mouse_listener:
            self.mouse_listener.stop()
            self.mouse_listener.join(timeout=2)
        
        self._save_data()
        print(f"\nТрекер остановлен. Итоговое время за сегодня: {self._format_time(self.active_seconds_today)}")
    
    def get_status(self):
        """Получение текущей статистики"""
        with self.lock:
            today_str = date.today().isoformat()
            active_today = self.history.get(today_str, {}).get("active_seconds", 0)
            
            stats = {
                "today": active_today,
                "formatted": self._format_time(active_today),
                "history_days": len(self.history)
            }
            
            return stats
    
    def get_history_summary(self):
        """Получение сводки по истории"""
        with self.lock:
            if not self.history:
                return "История пуста"
            
            lines = ["=== Статистика по дням ==="]
            sorted_dates = sorted(self.history.keys(), reverse=True)[:7]  # Последние 7 дней
            
            for date_str in sorted_dates:
                seconds = self.history[date_str].get("active_seconds", 0)
                formatted = self._format_time(seconds)
                lines.append(f"{date_str}: {formatted}")
            
            return "\n".join(lines)


def create_icon_image():
    """Создание иконки для трея"""
    size = (64, 64)
    image = Image.new('RGBA', size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    
    # Рисуем круг (мышь)
    draw.ellipse([8, 8, 56, 56], fill=(70, 130, 180, 255))
    draw.ellipse([16, 16, 48, 48], fill=(255, 255, 255, 255))
    
    # Рисуем стрелку (курсор)
    points = [(32, 24), (24, 44), (28, 40), (32, 52), (36, 40), (40, 44)]
    draw.polygon(points, fill=(70, 130, 180, 255))
    
    return image


def main():
    tracker = MouseTracker()
    tracker.start()
    
    # Создание иконки в трее
    icon_image = create_icon_image()
    
    def show_stats(icon, item):
        stats = tracker.get_status()
        history = tracker.get_history_summary()
        message = f"Активно сегодня: {stats['formatted']}\n\n{history}"
        print("\n" + message)
    
    def quit_app(icon, item):
        tracker.stop()
        icon.stop()
    
    # Настройка меню трея
    menu = (
        item("Показать статистику", show_stats),
        item("Выход", quit_app)
    )
    
    try:
        with icon(icon_image, APP_NAME, menu) as tray_icon:
            tray_icon.run()
    except Exception as e:
        print(f"Ошибка работы с треем: {e}")
        print("Работа в консольном режиме...")
        
        try:
            while tracker.running:
                time.sleep(1)
        except KeyboardInterrupt:
            tracker.stop()


if __name__ == "__main__":
    # Проверка одиночного экземпляра (опционально)
    try:
        import ctypes
        mutex = ctypes.windll.kernel32.CreateMutexW(None, True, "MouseTrackerSingleton")
        if ctypes.windll.kernel32.GetLastError() == 183:  # ERROR_ALREADY_EXISTS
            print("Программа уже запущена!")
            sys.exit(1)
    except Exception:
        pass  # Игнорируем ошибки проверки для совместимости
    
    try:
        main()
    except KeyboardInterrupt:
        print("\nПрограмма завершена пользователем")
    except Exception as e:
        print(f"Критическая ошибка: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
